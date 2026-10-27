package com.smartlibrary.service;

import com.smartlibrary.model.*;
import com.smartlibrary.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class BranchService {

    private final LibraryBranchRepository branchRepository;
    private final BookBranchRepository bookBranchRepository;
    private final BookTransferRepository bookTransferRepository;
    private final BookRepository bookRepository;

    public BranchService(LibraryBranchRepository branchRepository,
                         BookBranchRepository bookBranchRepository,
                         BookTransferRepository bookTransferRepository,
                         BookRepository bookRepository) {
        this.branchRepository = branchRepository;
        this.bookBranchRepository = bookBranchRepository;
        this.bookTransferRepository = bookTransferRepository;
        this.bookRepository = bookRepository;
    }

    // ─── Branch CRUD ───

    public List<LibraryBranch> getAllBranches() {
        return branchRepository.findByActiveTrue();
    }

    public List<LibraryBranch> getAllBranchesForAdmin() {
        return branchRepository.findAll();
    }

    public LibraryBranch getBranchById(Long id) {
        return branchRepository.findById(id)
                .orElseThrow(() -> new com.smartlibrary.exception.ResourceNotFoundException("Branch not found"));
    }

    public LibraryBranch createBranch(LibraryBranch branch) {
        return branchRepository.save(branch);
    }

    public LibraryBranch updateBranch(Long id, LibraryBranch updated) {
        LibraryBranch branch = getBranchById(id);
        if (updated.getName() != null) branch.setName(updated.getName());
        if (updated.getAddress() != null) branch.setAddress(updated.getAddress());
        if (updated.getPhone() != null) branch.setPhone(updated.getPhone());
        if (updated.getEmail() != null) branch.setEmail(updated.getEmail());
        if (updated.getDescription() != null) branch.setDescription(updated.getDescription());
        if (updated.getOpeningHours() != null) branch.setOpeningHours(updated.getOpeningHours());
        branch.setActive(updated.getActive());
        return branchRepository.save(branch);
    }

    public void deleteBranch(Long id) {
        branchRepository.deleteById(id);
    }

    // ─── Book-Branch Inventory ───

    public List<BookBranch> getBranchInventory(Long branchId) {
        return bookBranchRepository.findByBranchId(branchId);
    }

    public List<BookBranch> getBookBranches(Long bookId) {
        return bookBranchRepository.findByBookId(bookId);
    }

    public BookBranch addBookToBranch(Long branchId, Long bookId, int quantity) {
        LibraryBranch branch = getBranchById(branchId);
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new com.smartlibrary.exception.ResourceNotFoundException("Book not found"));

        Optional<BookBranch> existing = bookBranchRepository.findByBookIdAndBranchId(bookId, branchId);
        if (existing.isPresent()) {
            BookBranch bb = existing.get();
            bb.setQuantity(bb.getQuantity() + quantity);
            bb.setAvailableQuantity(bb.getAvailableQuantity() + quantity);
            return bookBranchRepository.save(bb);
        }

        BookBranch bb = new BookBranch();
        bb.setBook(book);
        bb.setBranch(branch);
        bb.setQuantity(quantity);
        return bookBranchRepository.save(bb);
    }

    // ─── Book Transfers ───

    public BookTransfer requestTransfer(Long fromBranchId, Long toBranchId, Long bookId, int quantity, String reason) {
        // Validate branch stock
        BookBranch fromBranchBook = bookBranchRepository.findByBookIdAndBranchId(bookId, fromBranchId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found in source branch"));
        if (fromBranchBook.getAvailableQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock in source branch");
        }

        BookTransfer transfer = new BookTransfer();
        transfer.setFromBranch(fromBranchBook.getBranch());
        transfer.setToBranch(getBranchById(toBranchId));
        transfer.setBook(fromBranchBook.getBook());
        transfer.setQuantity(quantity);
        transfer.setReason(reason);
        return bookTransferRepository.save(transfer);
    }

    @Transactional
    public BookTransfer approveTransfer(Long transferId, String notes) {
        BookTransfer transfer = bookTransferRepository.findById(transferId)
                .orElseThrow(() -> new IllegalArgumentException("Transfer not found"));
        if (transfer.getStatus() != TransferStatus.pending) {
            throw new IllegalStateException("Transfer is not in pending status");
        }

        // Move stock
        BookBranch fromBranchBook = bookBranchRepository
                .findByBookIdAndBranchId(transfer.getBook().getId(), transfer.getFromBranch().getId())
                .orElseThrow(() -> new IllegalArgumentException("Source stock record not found"));

        if (fromBranchBook.getAvailableQuantity() < transfer.getQuantity()) {
            throw new IllegalArgumentException("Insufficient stock. Available: " + fromBranchBook.getAvailableQuantity());
        }

        fromBranchBook.setAvailableQuantity(fromBranchBook.getAvailableQuantity() - transfer.getQuantity());
        bookBranchRepository.save(fromBranchBook);

        // Add to destination
        addBookToBranch(transfer.getToBranch().getId(), transfer.getBook().getId(), transfer.getQuantity());

        transfer.setStatus(TransferStatus.approved);
        if (notes != null) transfer.setNotes(notes);
        return bookTransferRepository.save(transfer);
    }

    public BookTransfer rejectTransfer(Long transferId, String notes) {
        BookTransfer transfer = bookTransferRepository.findById(transferId)
                .orElseThrow(() -> new IllegalArgumentException("Transfer not found"));
        transfer.setStatus(TransferStatus.rejected);
        if (notes != null) transfer.setNotes(notes);
        return bookTransferRepository.save(transfer);
    }

    public List<Map<String, Object>> getTransfers(Long branchId) {
        List<BookTransfer> transfers;
        if (branchId != null) {
            transfers = bookTransferRepository.findByFromBranchIdOrToBranchId(branchId, branchId);
        } else {
            transfers = bookTransferRepository.findAll();
        }
        return transfers.stream().map(t -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", t.getId());
            m.put("bookTitle", t.getBook().getTitle());
            m.put("bookId", t.getBook().getId());
            m.put("fromBranch", t.getFromBranch().getName());
            m.put("toBranch", t.getToBranch().getName());
            m.put("quantity", t.getQuantity());
            m.put("status", t.getStatus());
            m.put("reason", t.getReason());
            m.put("notes", t.getNotes());
            m.put("createdAt", t.getCreatedAt());
            return m;
        }).toList();
    }
}
