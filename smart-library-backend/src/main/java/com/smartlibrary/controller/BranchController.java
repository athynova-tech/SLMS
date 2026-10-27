package com.smartlibrary.controller;

import com.smartlibrary.model.BookBranch;
import com.smartlibrary.model.BookTransfer;
import com.smartlibrary.model.LibraryBranch;
import com.smartlibrary.service.BranchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/branches")
public class BranchController {

    private final BranchService branchService;

    public BranchController(BranchService branchService) {
        this.branchService = branchService;
    }

    // ─── BRANCH CRUD ───

    @GetMapping("/active")
    public ResponseEntity<List<LibraryBranch>> getActiveBranches() {
        return ResponseEntity.ok(branchService.getAllBranches());
    }

    @GetMapping
    public ResponseEntity<List<LibraryBranch>> getAllBranches() {
        return ResponseEntity.ok(branchService.getAllBranchesForAdmin());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LibraryBranch> getBranch(@PathVariable Long id) {
        return ResponseEntity.ok(branchService.getBranchById(id));
    }

    @PostMapping
    public ResponseEntity<LibraryBranch> createBranch(@RequestBody LibraryBranch branch) {
        return ResponseEntity.ok(branchService.createBranch(branch));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LibraryBranch> updateBranch(@PathVariable Long id, @RequestBody LibraryBranch branch) {
        return ResponseEntity.ok(branchService.updateBranch(id, branch));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBranch(@PathVariable Long id) {
        branchService.deleteBranch(id);
        return ResponseEntity.ok(Map.of("message", "Branch deleted"));
    }

    // ─── INVENTORY ───

    @GetMapping("/{id}/inventory")
    public ResponseEntity<List<BookBranch>> getBranchInventory(@PathVariable Long id) {
        return ResponseEntity.ok(branchService.getBranchInventory(id));
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<BookBranch>> getBookBranches(@PathVariable Long bookId) {
        return ResponseEntity.ok(branchService.getBookBranches(bookId));
    }

    @PostMapping("/{branchId}/add-book/{bookId}")
    public ResponseEntity<?> addBookToBranch(@PathVariable Long branchId, @PathVariable Long bookId,
                                               @RequestBody Map<String, Integer> body) {
        try {
            BookBranch bb = branchService.addBookToBranch(branchId, bookId, body.getOrDefault("quantity", 1));
            return ResponseEntity.ok(Map.of(
                "id", bb.getId(),
                "bookTitle", bb.getBook().getTitle(),
                "branchName", bb.getBranch().getName(),
                "quantity", bb.getQuantity(),
                "availableQuantity", bb.getAvailableQuantity()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─── TRANSFERS ───

    @PostMapping("/transfer")
    public ResponseEntity<?> requestTransfer(@RequestBody Map<String, Object> body) {
        try {
            Long fromBranchId = Long.valueOf(body.get("fromBranchId").toString());
            Long toBranchId = Long.valueOf(body.get("toBranchId").toString());
            Long bookId = Long.valueOf(body.get("bookId").toString());
            int quantity = Integer.parseInt(body.get("quantity").toString());
            String reason = (String) body.get("reason");
            BookTransfer transfer = branchService.requestTransfer(fromBranchId, toBranchId, bookId, quantity, reason);
            return ResponseEntity.ok(Map.of(
                "id", transfer.getId(),
                "bookTitle", transfer.getBook().getTitle(),
                "fromBranch", transfer.getFromBranch().getName(),
                "toBranch", transfer.getToBranch().getName(),
                "quantity", transfer.getQuantity(),
                "status", transfer.getStatus(),
                "message", "Transfer request created"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/transfer/{id}/approve")
    public ResponseEntity<?> approveTransfer(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        try {
            String notes = body != null ? body.get("notes") : null;
            BookTransfer transfer = branchService.approveTransfer(id, notes);
            return ResponseEntity.ok(Map.of("message", "Transfer approved", "status", transfer.getStatus().name()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/transfer/{id}/reject")
    public ResponseEntity<?> rejectTransfer(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        try {
            String notes = body != null ? body.get("notes") : null;
            BookTransfer transfer = branchService.rejectTransfer(id, notes);
            return ResponseEntity.ok(Map.of("message", "Transfer rejected", "status", transfer.getStatus().name()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/transfers")
    public ResponseEntity<List<Map<String, Object>>> getTransfers(
            @RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(branchService.getTransfers(branchId));
    }
}
