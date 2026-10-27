package com.smartlibrary.dto;

public record ResetPasswordRequest(String token, String newPassword) {}
