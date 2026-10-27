package com.smartlibrary.controller;

import com.smartlibrary.service.ReportsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {

    private final ReportsService reportsService;

    public ReportsController(ReportsService reportsService) {
        this.reportsService = reportsService;
    }

    @GetMapping("/daily")
    public ResponseEntity<Map<String, Object>> getDaily() {
        return ResponseEntity.ok(reportsService.getDaily());
    }

    @GetMapping("/fines")
    public ResponseEntity<Map<String, Object>> getFines() {
        return ResponseEntity.ok(reportsService.getFines());
    }

    @GetMapping("/users/activity")
    public ResponseEntity<Map<String, Object>> getUserActivity() {
        return ResponseEntity.ok(reportsService.getUserActivity());
    }

    @GetMapping("/inventory")
    public ResponseEntity<Map<String, Object>> getInventory() {
        return ResponseEntity.ok(reportsService.getInventory());
    }
}
