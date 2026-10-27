package com.smartlibrary.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.smartlibrary.model.Book;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.util.Base64;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;

@Service
public class QRCodeService {

    public BufferedImage generateQRCodeImage(String content, int width, int height) throws WriterException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(content, com.google.zxing.BarcodeFormat.QR_CODE, width, height);
        return MatrixToImageWriter.toBufferedImage(bitMatrix);
    }

    public String generateQRCodeBase64(String content, int width, int height) {
        try {
            BufferedImage qrImage = generateQRCodeImage(content, width, height);
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            javax.imageio.ImageIO.write(qrImage, "png", baos);
            byte[] imageBytes = baos.toByteArray();
            return "data:image/png;base64," + java.util.Base64.getEncoder().encodeToString(imageBytes);
        } catch (Exception e) {
            return null;
        }
    }

    public String generateBookQRContent(com.smartlibrary.model.Book book) {
        return String.format(
            "SMARTLIB:%d:%s:%s",
            book.getId(),
            book.getIsbn() != null ? book.getIsbn() : "NOISBN",
            book.getTitle().replace(":", "-")
        );
    }
}
