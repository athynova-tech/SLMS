package com.smartlibrary.controller;

import com.smartlibrary.model.Book;
import com.smartlibrary.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        return ResponseEntity.ok(dashboardService.getOverview());
    }

    @GetMapping("/popular/books")
    public ResponseEntity<List<Book>> getPopularBooks(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(dashboardService.getPopularBooks(limit));
    }

    @GetMapping("/popular/categories")
    public ResponseEntity<List<Map<String, Object>>> getPopularCategories(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(dashboardService.getPopularCategories(limit));
    }

    @GetMapping("/recent/borrows")
    public ResponseEntity<List<Map<String, Object>>> getRecentBorrows(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(dashboardService.getRecentBorrows(limit));
    }

    @GetMapping("/charts/monthly-borrows")
    public ResponseEntity<Map<String, Object>> getMonthlyBorrows(@RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(dashboardService.getMonthlyBorrows(months));
    }

    @GetMapping("/charts/classification")
    public ResponseEntity<Map<String, Object>> getClassificationChart() {
        return ResponseEntity.ok(dashboardService.getClassificationChart());
    }

    // ─── ADVANCED ANALYTICS ───

    @GetMapping("/advanced-stats")
    public ResponseEntity<Map<String, Object>> getAdvancedStats() {
        return ResponseEntity.ok(dashboardService.getAdvancedStats());
    }

    @GetMapping("/top-borrowers")
    public ResponseEntity<List<Map<String, Object>>> getTopBorrowers(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(dashboardService.getTopBorrowers(limit));
    }

    @GetMapping("/peak-hours")
    public ResponseEntity<Map<String, Object>> getPeakHours() {
        return ResponseEntity.ok(dashboardService.getPeakHours());
    }

    @GetMapping("/weekday-heatmap")
    public ResponseEntity<Map<String, Object>> getWeekdayHeatmap() {
        return ResponseEntity.ok(dashboardService.getWeekdayHeatmap());
    }

    @GetMapping("/projected-trends")
    public ResponseEntity<Map<String, Object>> getProjectedTrends() {
        return ResponseEntity.ok(dashboardService.getProjectedTrends());
    }

    @GetMapping("/reading-patterns")
    public ResponseEntity<Map<String, Object>> getReadingPatterns() {
        return ResponseEntity.ok(dashboardService.getReadingPatterns());
    }
}
