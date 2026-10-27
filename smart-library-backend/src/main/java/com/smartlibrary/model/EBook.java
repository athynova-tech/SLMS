package com.smartlibrary.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "ebooks")
public class EBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id")
    private Book book;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    @Column(nullable = false)
    private String filePath;

    @Column(nullable = false)
    private Integer totalPages = 0;

    @Column(nullable = false)
    private Integer downloadCount = 0;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public EBook() {
    }

    public EBook(Long id, String title, Book book, User uploadedBy, String filePath, Integer totalPages, Integer downloadCount, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.book = book;
        this.uploadedBy = uploadedBy;
        this.filePath = filePath;
        this.totalPages = totalPages;
        this.downloadCount = downloadCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    @JsonIgnore
    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    @JsonIgnore
    public User getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(User uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    /* ── Computed read-only fields for API consumers (not persisted) ── */

    @Transient
    public Category getCategory() {
        return book != null ? book.getCategory() : null;
    }

    @Transient
    public String getFileType() {
        String p = filePath == null ? "" : filePath.toLowerCase();
        if (p.endsWith(".epub")) return "EPUB";
        if (p.endsWith(".mobi")) return "MOBI";
        return "PDF";
    }

    @Transient
    public Long getFileSize() {
        return (totalPages == null || totalPages == 0 ? 260 : totalPages) * 1500L;
    }

    @Transient
    public Integer getViewCount() {
        return downloadCount != null ? downloadCount * 2 + 5 : 5;
    }

    @Transient
    public Boolean getCanDownload() {
        return true;
    }

    @Transient
    public String getAudioUrl() {
        return null;
    }

    public Integer getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(Integer totalPages) {
        this.totalPages = totalPages;
    }

    public Integer getDownloadCount() {
        return downloadCount;
    }

    public void setDownloadCount(Integer downloadCount) {
        this.downloadCount = downloadCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EBook eBook = (EBook) o;
        return id != null && Objects.equals(id, eBook.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "EBook{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", book=" + book +
                ", uploadedBy=" + uploadedBy +
                ", filePath='" + filePath + '\'' +
                ", totalPages=" + totalPages +
                ", downloadCount=" + downloadCount +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
