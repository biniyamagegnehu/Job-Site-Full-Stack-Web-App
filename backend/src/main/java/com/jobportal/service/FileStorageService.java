package com.jobportal.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String storeFile(MultipartFile file, String subdirectory);
    void deleteFile(String filePath);
    Resource loadFileAsResource(String subdirectory, String filename);
} 





