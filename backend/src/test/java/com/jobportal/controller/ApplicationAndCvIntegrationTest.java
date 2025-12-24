package com.jobportal.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobportal.entity.Employer;
import com.jobportal.entity.Job;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ApplicationAndCvIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void uploadCvAndApplyToJob_successAndDuplicateApply() throws Exception {
        // Login as job seeker
        String loginPayload = "{\"identifier\":\"john.doe@email.com\",\"password\":\"password123\"}";
        String loginResp = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginPayload))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JsonNode loginJson = objectMapper.readTree(loginResp);
        String token = loginJson.path("data").path("user").path("accessToken").asText();
        assertThat(token).isNotBlank();

        // Prepare a job (associate with existing employer)
        Employer employer = (Employer) userRepository.findByEmail("techcorp@company.com").orElseThrow();
        Job job = new Job();
        job.setTitle("Integration Test Job");
        job.setEmployer(employer);
        job.setLocation("Remote");
        job.setDescription("Integration test job description");
        job.setActive(true);
        Job savedJob = jobRepository.save(job);

        // Upload CV file
        MockMultipartFile file = new MockMultipartFile("file", "cv.pdf", "application/pdf",
                "Test PDF content".getBytes(StandardCharsets.UTF_8));

        String uploadResp = mockMvc.perform(multipart("/api/job-seekers/cv/upload")
                .file(file)
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.cv.fileUrl").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

        JsonNode uploadJson = objectMapper.readTree(uploadResp);
        String fileUrl = uploadJson.path("data").path("cv").path("fileUrl").asText();
        assertThat(fileUrl).contains("/uploads/cvs/");

        // Apply to job using the uploaded CV URL
        String applyPayload = objectMapper.createObjectNode()
                .put("jobId", savedJob.getId())
                .put("coverLetter", "Please consider my application")
                .put("cvFileUrl", fileUrl)
                .toString();

        String applyResp = mockMvc.perform(post("/api/applications")
                .contentType(MediaType.APPLICATION_JSON)
                .content(applyPayload)
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.application.jobId").value(savedJob.getId()))
                .andExpect(jsonPath("$.data.application.cvFileUrl").value(fileUrl))
                .andReturn().getResponse().getContentAsString();

        JsonNode applyJson = objectMapper.readTree(applyResp);
        Long applicationId = applyJson.path("data").path("application").path("id").asLong();
        assertThat(applicationId).isGreaterThan(0);

        // Attempt duplicate apply -> expect 400
        mockMvc.perform(post("/api/applications")
                .contentType(MediaType.APPLICATION_JSON)
                .content(applyPayload)
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Duplicate application"));
    }

    @Test
    public void deleteCv_removesCvAndFile() throws Exception {
        // Login as job seeker
        String loginPayload = "{\"identifier\":\"john.doe@email.com\",\"password\":\"password123\"}";
        String loginResp = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginPayload))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JsonNode loginJson = objectMapper.readTree(loginResp);
        String token = loginJson.path("data").path("user").path("accessToken").asText();

        // Upload CV file
        MockMultipartFile file = new MockMultipartFile("file", "cv_delete.pdf", "application/pdf",
                "Delete Test PDF".getBytes(StandardCharsets.UTF_8));

        String uploadResp = mockMvc.perform(multipart("/api/job-seekers/cv/upload")
                .file(file)
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.cv.fileUrl").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

        JsonNode uploadJson = objectMapper.readTree(uploadResp);
        String fileUrl = uploadJson.path("data").path("cv").path("fileUrl").asText();

        // Delete CV
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/job-seekers/cv")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("CV deleted successfully"));

        // Ensure CV no longer exists
        String getResp = mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/job-seekers/cv")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JsonNode getJson = objectMapper.readTree(getResp);
        JsonNode cvNode = getJson.path("data").path("cv");
        assertThat(cvNode.isNull() || cvNode.isMissingNode()).isTrue();
    }
}