package com.smartlibrary.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "bookmarks")
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ebook_id", nullable = false)
    private EBook ebook;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer page;

    private String note;

    @Column(length = 2000)
    private String highlightedText;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    public Bookmark() {
    }

    public Bookmark(Long id, EBook ebook, User user, Integer page, String note, String highlightedText, LocalDateTime createdAt) {
        this.id = id;
        this.ebook = ebook;
        this.user = user;
        this.page = page;
        this.note = note;
        this.highlightedText = highlightedText;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public EBook getEbook() {
        return ebook;
    }

    public void setEbook(EBook ebook) {
        this.ebook = ebook;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getHighlightedText() {
        return highlightedText;
    }

    public void setHighlightedText(String highlightedText) {
        this.highlightedText = highlightedText;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Bookmark bookmark = (Bookmark) o;
        return id != null && Objects.equals(id, bookmark.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Bookmark{" +
                "id=" + id +
                ", ebook=" + ebook +
                ", user=" + user +
                ", page=" + page +
                ", note='" + note + '\'' +
                ", highlightedText='" + highlightedText + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
