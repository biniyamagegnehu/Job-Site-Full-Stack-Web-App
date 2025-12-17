package com.jobportal.controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
public class HomeController {
    @GetMapping("/") public String home() { return "✅ RUNNING!"; }
    @GetMapping("/test") public String test() { return "✅ TEST OK!"; }
    @GetMapping("/health") public String health() { return "✅ HEALTH OK!"; }
}
