package com.smartlibrary.repository;

import com.smartlibrary.model.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findByEbookIdAndUserId(Long ebookId, Long userId);
}
