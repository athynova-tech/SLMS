package com.smartlibrary.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    private String isbn;

    @Column(length = 2000)
    private String description;

    private String publisher;

    private Integer publicationYear;

    private String edition;

    @Column(nullable = false)
    private Integer totalCopies = 1;

    @Column(nullable = false)
    private Integer availableCopies = 1;

    private String shelfLocation;

    private String language;

    @Column(nullable = false)
    private Integer pageCount = 0;

    private String coverImage;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    private Double averageRating = 0.0;

    @Column(nullable = false)
    private Integer ratingCount = 0;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Book() {
    }

    public Book(Long id, String title, String author, String isbn, String description, String publisher, Integer publicationYear, String edition, Integer totalCopies, Integer availableCopies, String shelfLocation, String language, Integer pageCount, String coverImage, Category category, Double averageRating, Integer ratingCount, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.description = description;
        this.publisher = publisher;
        this.publicationYear = publicationYear;
        this.edition = edition;
        this.totalCopies = totalCopies;
        this.availableCopies = availableCopies;
        this.shelfLocation = shelfLocation;
        this.language = language;
        this.pageCount = pageCount;
        this.coverImage = coverImage;
        this.category = category;
        this.averageRating = averageRating;
        this.ratingCount = ratingCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPublisher() {
        return publisher;
    }

    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public Integer getPublicationYear() {
        return publicationYear;
    }

    public void setPublicationYear(Integer publicationYear) {
        this.publicationYear = publicationYear;
    }

    public String getEdition() {
        return edition;
    }

    public void setEdition(String edition) {
        this.edition = edition;
    }

    public Integer getTotalCopies() {
        return totalCopies;
    }

    public void setTotalCopies(Integer totalCopies) {
        this.totalCopies = totalCopies;
    }

    public Integer getAvailableCopies() {
        return availableCopies;
    }

    public void setAvailableCopies(Integer availableCopies) {
        this.availableCopies = availableCopies;
    }

    public String getShelfLocation() {
        return shelfLocation;
    }

    public void setShelfLocation(String shelfLocation) {
        this.shelfLocation = shelfLocation;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public Integer getPageCount() {
        return pageCount;
    }

    public void setPageCount(Integer pageCount) {
        this.pageCount = pageCount;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Integer getRatingCount() {
        return ratingCount;
    }

    public void setRatingCount(Integer ratingCount) {
        this.ratingCount = ratingCount;
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
        Book book = (Book) o;
        return Objects.equals(id, book.id) && Objects.equals(title, book.title) && Objects.equals(author, book.author) && Objects.equals(isbn, book.isbn) && Objects.equals(description, book.description) && Objects.equals(publisher, book.publisher) && Objects.equals(publicationYear, book.publicationYear) && Objects.equals(edition, book.edition) && Objects.equals(totalCopies, book.totalCopies) && Objects.equals(availableCopies, book.availableCopies) && Objects.equals(shelfLocation, book.shelfLocation) && Objects.equals(language, book.language) && Objects.equals(pageCount, book.pageCount) && Objects.equals(coverImage, book.coverImage) && Objects.equals(category, book.category) && Objects.equals(averageRating, book.averageRating) && Objects.equals(ratingCount, book.ratingCount) && Objects.equals(createdAt, book.createdAt) && Objects.equals(updatedAt, book.updatedAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, title, author, isbn, description, publisher, publicationYear, edition, totalCopies, availableCopies, shelfLocation, language, pageCount, coverImage, category, averageRating, ratingCount, createdAt, updatedAt);
    }

    @Override
    public String toString() {
        return "Book{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", author='" + author + '\'' +
                ", isbn='" + isbn + '\'' +
                ", description='" + description + '\'' +
                ", publisher='" + publisher + '\'' +
                ", publicationYear=" + publicationYear +
                ", edition='" + edition + '\'' +
                ", totalCopies=" + totalCopies +
                ", availableCopies=" + availableCopies +
                ", shelfLocation='" + shelfLocation + '\'' +
                ", language='" + language + '\'' +
                ", pageCount=" + pageCount +
                ", coverImage='" + coverImage + '\'' +
                ", category=" + category +
                ", averageRating=" + averageRating +
                ", ratingCount=" + ratingCount +
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
