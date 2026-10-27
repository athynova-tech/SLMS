package com.smartlibrary.repository;

import com.smartlibrary.model.BookTransfer;
import com.smartlibrary.model.TransferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookTransferRepository extends JpaRepository<BookTransfer, Long> {
    List<BookTransfer> findByFromBranchIdOrToBranchId(Long fromBranchId, Long toBranchId);
    List<BookTransfer> findByStatus(TransferStatus status);
}
