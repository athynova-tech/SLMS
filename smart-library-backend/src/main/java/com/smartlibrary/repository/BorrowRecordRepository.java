package com.smartlibrary.repository;

import com.smartlibrary.model.BorrowRecord;
import com.smartlibrary.model.BorrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    List<BorrowRecord> findByUserId(Long userId);
    List<BorrowRecord> findByBookId(Long bookId);
    List<BorrowRecord> findByStatus(BorrowStatus status);

    @Query("SELECT COUNT(b) FROM BorrowRecord b WHERE MONTH(b.borrowDate) = :month AND YEAR(b.borrowDate) = :year")
    long countByBorrowMonth(int month, int year);
}
