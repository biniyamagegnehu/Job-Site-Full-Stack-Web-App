package com.jobportal.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void registerEmployer_missingCompanyName_returnsBadRequest() throws Exception {
        String payload = "{\"email\":\"employer1@test.com\",\"username\":\"employer1\",\"password\":\"password123\",\"role\":\"ROLE_EMPLOYER\"}";

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.validationErrors").isMap())
                .andExpect(result -> {
                    String body = result.getResponse().getContentAsString();
                    if (!body.contains("Company name is required for employers")) {
                        throw new AssertionError("Expected validation message not found in response: " + body);
                    }
                });
    }

    @Test
    public void registerEmployer_withCompanyName_succeeds() throws Exception {
        String payload = "{\"email\":\"employer2@test.com\",\"username\":\"employer2\",\"password\":\"password123\",\"role\":\"ROLE_EMPLOYER\",\"companyName\":\"TestCo\"}";

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("User registered successfully"))
                .andExpect(jsonPath("$.data.user.email").value("employer2@test.com"))
                .andExpect(jsonPath("$.data.user.role").value("ROLE_EMPLOYER"));

        // Login should be allowed since employers are approved by default in registration
        String loginPayload = "{\"identifier\":\"employer2@test.com\",\"password\":\"password123\"}";
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.user.accessToken").isNotEmpty());
    }
}
