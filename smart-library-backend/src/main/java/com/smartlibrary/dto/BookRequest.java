package com.smartlibrary.dto;

public record BookRequest(
    String title,
    String author,
    String isbn,
    String description,
    String publisher,
    Integer publicationYear,
    String edition,
    Integer totalCopies,
    String shelfLocation,
    String language,
    Integer pageCount,
    Long categoryId
) {}
