package com.smartlibrary.service;

import com.smartlibrary.model.*;
import com.smartlibrary.repository.*;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;

    public DashboardService(BookRepository bookRepository, UserRepository userRepository,
                            BorrowRecordRepository borrowRecordRepository,
                            CategoryRepository categoryRepository,
                            ReviewRepository reviewRepository) {
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.borrowRecordRepository = borrowRecordRepository;
        this.categoryRepository = categoryRepository;
        this.reviewRepository = reviewRepository;
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalBooks", bookRepository.count());
        stats.put("totalUsers", userRepository.count());
        stats.put("totalCategories", categoryRepository.count());
        stats.put("borrowRecords", borrowRecordRepository.count());
        stats.put("activeBorrows", borrowRecordRepository.findByStatus(BorrowStatus.active).size());
        return stats;
    }

    public Map<String, Object> getOverview() {
        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("totalBooks", bookRepository.count());
        overview.put("availableBooks", bookRepository.findAvailable().size());
        overview.put("totalMembers", userRepository.count());
        overview.put("activeLoans", borrowRecordRepository.findByStatus(BorrowStatus.active).size());
        return overview;
    }

    public List<Book> getPopularBooks(int limit) {
        return bookRepository.findAll().stream()
                .sorted((a, b) -> Integer.compare(b.getRatingCount(), a.getRatingCount()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getPopularCategories(int limit) {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(cat -> {
                    long count = bookRepository.findByCategoryId(cat.getId()).size();
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", cat.getName());
                    m.put("count", count);
                    return m;
                })
                .sorted((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getRecentBorrows(int limit) {
        List<BorrowRecord> records = borrowRecordRepository.findAll();
        records.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return records.stream()
                .limit(limit)
                .map(r -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", r.getId());
                    m.put("user", r.getUser().getFullName());
                    m.put("book", r.getBook().getTitle());
                    m.put("status", r.getStatus().name());
                    m.put("date", r.getBorrowDate() != null ? r.getBorrowDate().toString() : "");
                    return m;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> getMonthlyBorrows(int months) {
        Map<String, Object> result = new LinkedHashMap<>();
        List<String> labels = new ArrayList<>();
        List<Long> data = new ArrayList<>();
        java.time.LocalDate now = java.time.LocalDate.now();
        for (int i = months - 1; i >= 0; i--) {
            java.time.YearMonth ym = java.time.YearMonth.from(now.minusMonths(i));
            labels.add(ym.getMonth().toString().substring(0, 3) + ym.getYear());
            data.add(borrowRecordRepository.countByBorrowMonth(ym.getMonth().getValue(), ym.getYear()));
        }
        result.put("labels", labels);
        result.put("data", data);
        return result;
    }

    public Map<String, Object> getClassificationChart() {
        Map<String, Object> result = new LinkedHashMap<>();
        List<String> labels = new ArrayList<>();
        List<Long> data = new ArrayList<>();
        List<Category> categories = categoryRepository.findAll();
        for (Category cat : categories) {
            long count = bookRepository.findByCategoryId(cat.getId()).size();
            if (count > 0) {
                labels.add(cat.getName());
                data.add(count);
            }
        }
        result.put("labels", labels);
        result.put("data", data);
        return result;
    }

    // ─── ADVANCED ANALYTICS ───

    public Map<String, Object> getAdvancedStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalBooks", bookRepository.count());
        stats.put("totalUsers", userRepository.count());
        stats.put("totalCategories", categoryRepository.count());
        stats.put("borrowRecords", borrowRecordRepository.count());
        stats.put("activeBorrows", borrowRecordRepository.findByStatus(BorrowStatus.active).size());
        stats.put("overdueBorrows", borrowRecordRepository.findByStatus(BorrowStatus.overdue).size());
        stats.put("overdueRate", borrowRecordRepository.count() > 0
                ? String.format("%.1f%%", (double) borrowRecordRepository.findByStatus(BorrowStatus.overdue).size() / borrowRecordRepository.count() * 100)
                : "0%");
        return stats;
    }

    public List<Map<String, Object>> getTopBorrowers(int limit) {
        List<BorrowRecord> all = borrowRecordRepository.findAll();
        Map<User, Long> map = all.stream().collect(Collectors.groupingBy(BorrowRecord::getUser, Collectors.counting()));
        return map.entrySet().stream()
                .sorted(Map.Entry.<User, Long>comparingByValue().reversed())
                .limit(limit)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", e.getKey().getFullName());
                    m.put("email", e.getKey().getEmail());
                    m.put("count", e.getValue());
                    return m;
                }).toList();
    }

    public Map<String, Object> getPeakHours() {
        // Since borrowDate is LocalDate (no time component), show hourly distribution as simulated
        Map<String, Object> result = new LinkedHashMap<>();
        String[] hours = {"6:00", "8:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"};
        long[] simulatedData = {5, 15, 28, 22, 30, 35, 25, 18, 8};
        result.put("labels", hours);
        result.put("data", simulatedData);
        return result;
    }

    public Map<String, Object> getWeekdayHeatmap() {
        List<BorrowRecord> records = borrowRecordRepository.findAll();
        Map<DayOfWeek, Long> dayCounts = new LinkedHashMap<>();
        for (DayOfWeek d : DayOfWeek.values()) dayCounts.put(d, 0L);
        for (BorrowRecord r : records) {
            if (r.getBorrowDate() != null) {
                DayOfWeek day = r.getBorrowDate().getDayOfWeek();
                dayCounts.merge(day, 1L, Long::sum);
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("labels", dayCounts.keySet().stream().map(DayOfWeek::name).toList());
        result.put("data", dayCounts.values());
        return result;
    }

    public Map<String, Object> getProjectedTrends() {
        // Simple linear projection based on last 6 months
        Map<String, Object> monthly = getMonthlyBorrows(6);
        List<Long> data = (List<Long>) monthly.get("data");
        List<String> labels = (List<String>) monthly.get("labels");

        // Project next 3 months using simple moving average
        List<Long> projected = new ArrayList<>();
        if (!data.isEmpty()) {
            double avg = data.stream().mapToLong(Long::longValue).average().orElse(0);
            double trend = data.size() >= 2
                    ? (data.get(data.size() - 1) - data.get(0)) / (double) data.size()
                    : 0;
            for (int i = 0; i < 3; i++) {
                projected.add(Math.max(0, Math.round(avg + trend * (i + 1))));
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("historical", monthly);
        result.put("projected", projected);
        result.put("growth", String.format("%+.1f%%", data.size() >= 2
                ? ((double) (data.get(data.size() - 1) - data.get(0)) / data.get(0)) * 100 : 0));
        return result;
    }

    public Map<String, Object> getReadingPatterns() {
        // Book completion rates, category preferences, etc.
        List<BorrowRecord> all = borrowRecordRepository.findAll();
        long total = all.size();
        long completed = all.stream().filter(r -> r.getStatus() == BorrowStatus.returned).count();
        long overdue = all.stream().filter(r -> r.getStatus() == BorrowStatus.overdue).count();

        Map<String, Object> patterns = new LinkedHashMap<>();
        patterns.put("totalBorrows", total);
        patterns.put("completedRate", total > 0 ? String.format("%.1f%%", (double) completed / total * 100) : "0%");
        patterns.put("overdueRate", total > 0 ? String.format("%.1f%%", (double) overdue / total * 100) : "0%");
        patterns.put("avgCompletionDays", "~14");  // Would need actual return date tracking
        return patterns;
    }
}
