package com.smartlibrary.repository;

import com.smartlibrary.model.LibraryBranch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LibraryBranchRepository extends JpaRepository<LibraryBranch, Long> {
    List<LibraryBranch> findByActiveTrue();
}
