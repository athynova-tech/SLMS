package com.smartlibrary.dto;

public record ChangePasswordRequest(String oldPassword, String newPassword) {}
