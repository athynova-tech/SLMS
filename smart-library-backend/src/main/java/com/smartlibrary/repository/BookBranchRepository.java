package com.smartlibrary.repository;

import com.smartlibrary.model.Book;
import com.smartlibrary.model.BookBranch;
import com.smartlibrary.model.LibraryBranch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookBranchRepository extends JpaRepository<BookBranch, Long> {
    List<BookBranch> findByBookId(Long bookId);
    List<BookBranch> findByBranchId(Long branchId);
    Optional<BookBranch> findByBookIdAndBranchId(Long bookId, Long branchId);
}
