package com.jobportal.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String storeFile(MultipartFile file, String subdirectory);
    void deleteFile(String filePath);
}




