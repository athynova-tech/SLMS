package com.smartlibrary.dto;

public record ReviewRequest(Long bookId, Integer rating, String comment) {}
