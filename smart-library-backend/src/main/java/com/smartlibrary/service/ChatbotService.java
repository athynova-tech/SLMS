package com.smartlibrary.service;

import com.smartlibrary.model.Book;
import com.smartlibrary.model.BorrowRecord;
import com.smartlibrary.repository.BookRepository;
import com.smartlibrary.repository.BorrowRecordRepository;
import com.smartlibrary.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final UserRepository userRepository;

    private static final Map<String, String> FAQ = new LinkedHashMap<>();

    public ChatbotService(BookRepository bookRepository,
                          BorrowRecordRepository borrowRecordRepository,
                          UserRepository userRepository) {
        this.bookRepository = bookRepository;
        this.borrowRecordRepository = borrowRecordRepository;
        this.userRepository = userRepository;

        FAQ.put("borrow", "To borrow a book:\n1. Search for the book in the catalog\n2. Click 'Borrow' on the book details page\n3. A librarian will approve your request\n4. Pick up the book at the circulation desk\n\nBorrowing period is 14 days with a 7-day grace period.");
        FAQ.put("return", "To return a book:\n1. Bring the book to the circulation desk\n2. Or use the self-return kiosk\n3. The system will update the record automatically\n\nLate returns incur a fine of $0.50 per day.");
        FAQ.put("fine", "Fine policy:\n- $0.50 per day for late returns\n- 3-day grace period\n- Maximum fine per book: $15.00\n- Fines can be paid at the circulation desk or online\n- Unpaid fines will block new borrowings");
        FAQ.put("reserve", "To reserve a book:\n1. Go to the book details page\n2. Click 'Reserve' if all copies are checked out\n3. You'll be added to the queue\n4. You'll get a notification when it's available\n5. Pick up within 48 hours or the reservation is released");
        FAQ.put("hours", "Library hours:\nMonday-Friday: 8:00 AM - 9:00 PM\nSaturday: 9:00 AM - 6:00 PM\nSunday: 12:00 PM - 5:00 PM\n\nClosed on public holidays.");
        FAQ.put("register", "To get a library membership:\n1. Go to the Registration page\n2. Fill in your details (email, name, phone)\n3. Visit the library with your ID to verify\n4. You'll get your membership card within 24 hours");
        FAQ.put("ebook", "eBooks are available in our digital library:\n1. Search for a book with the 'eBook' tag\n2. Click 'Read Online' to open the reader\n3. You can bookmark pages, highlight text, and take notes\n4. eBooks are available 24/7 from any device");
        FAQ.put("lost", "If you lost a book:\n1. Report it immediately at the circulation desk\n2. You'll need to pay the replacement cost + a processing fee\n3. Your borrowing privileges will be suspended until resolved\n4. Contact librarian@library.com for more information");
    }

    public Map<String, Object> processMessage(String message, Long userId) {
        String lower = message.toLowerCase().trim();

        // Detect intent
        String intent = detectIntent(lower);
        String response;
        List<Map<String, Object>> books = null;

        switch (intent) {
            case "greeting" -> response = getGreeting(userId);
            case "search" -> {
                String query = extractSearchQuery(lower);
                List<Book> found = bookRepository
                        .findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(query, query);
                books = found.stream().limit(5).map(this::bookToMap).toList();
                if (found.isEmpty()) {
                    response = "I couldn't find any books matching \"" + query + "\". Try different keywords or check the spelling.";
                } else {
                    response = "Here are " + Math.min(found.size(), 5) + " book(s) I found for \"" + query + "\":";
                }
            }
            case "recommend" -> {
                List<Book> popular = bookRepository.findAvailable().stream()
                        .sorted((a, b) -> b.getRatingCount().compareTo(a.getRatingCount()))
                        .limit(6).toList();
                books = popular.stream().map(this::bookToMap).toList();
                response = "Here are some popular books you might enjoy:";
            }
            case "status" -> response = getStatus(userId);
            case "faq" -> response = getFaqAnswer(lower);
            default -> response = "I'm your Library AI Assistant! I can help you with:\n"
                    + "🔍 Search books (e.g., \"find books about AI\")\n"
                    + "📚 Recommendations (e.g., \"recommend me a book\")\n"
                    + "❓ FAQs (e.g., \"borrow policy\", \"library hours\", \"fines\")\n"
                    + "📊 Account status (e.g., \"my borrowed books\")\n\nHow can I help you today?";
        }

        Map<String, Object> result = new HashMap<>();
        result.put("response", response);
        result.put("intent", intent);
        if (books != null) result.put("books", books);
        return result;
    }

    private String detectIntent(String message) {
        if (message.matches(".*\\b(hi|hello|hey|good morning|good evening|good afternoon|howdy|greetings)\\b.*") &&
                !message.contains("find") && !message.contains("search")) {
            return "greeting";
        }
        if (message.matches(".*\\b(find|search|look for|looking for|show me|where is|where can i find|i need|books about|book about|show)\\b.*")) {
            return "search";
        }
        if (message.matches(".*\\b(recommend|suggest|popular|top|best|what should i read|what to read)\\b.*")) {
            return "recommend";
        }
        if (message.matches(".*\\b(my (borrowed|checked out|books)|status|account|what i have|currently reading)\\b.*")) {
            return "status";
        }
        if (message.matches(".*\\b(borrow|return|fine|reserve|hours|register|ebook|lost|policy|how to|what is|how do i|what are)\\b.*")) {
            return "faq";
        }
        return "unknown";
    }

    private String extractSearchQuery(String message) {
        // Remove known prefixes
        String query = message
                .replaceAll(".*\\b(find|search for|search|look for|looking for|show me|where is|where can i find|i need|books about|book about|show|recommend|suggest)\\b\\s*", "")
                .replaceAll("\\b(books?|about|on|related to|for me|please|thanks|thank you)\\b", "")
                .trim();
        if (query.isEmpty()) {
            // Try extracting after "about" or after "on"
            if (message.contains("about")) {
                query = message.substring(message.indexOf("about") + 5).trim();
            } else if (message.contains(" on ")) {
                query = message.substring(message.indexOf(" on ") + 4).trim();
            }
        }
        return query.isEmpty() ? message.replaceAll("\\b(hi|hello|hey|please|thanks)\\b", "").trim() : query;
    }

    private String getGreeting(Long userId) {
        if (userId != null) {
            return userRepository.findById(userId)
                    .map(u -> "Hello " + u.getFullName() + "! Welcome to the Smart Library. How can I help you today?")
                    .orElse("Hello! Welcome to the Smart Library. How can I help you today?");
        }
        return "Hello! Welcome to the Smart Library. I'm your AI assistant. How can I help you today?";
    }

    private String getStatus(Long userId) {
        if (userId == null) return "Please log in to check your account status.";
        List<BorrowRecord> active = borrowRecordRepository.findByUserId(userId).stream()
                .filter(b -> b.getStatus() == com.smartlibrary.model.BorrowStatus.active
                        || b.getStatus() == com.smartlibrary.model.BorrowStatus.overdue)
                .toList();
        if (active.isEmpty()) return "You have no books currently borrowed. Why not browse our catalog?";
        long overdue = active.stream().filter(b -> b.getStatus() == com.smartlibrary.model.BorrowStatus.overdue).count();
        double totalFines = active.stream()
                .mapToDouble(b -> b.getFineAmount() != null ? b.getFineAmount().doubleValue() : 0.0)
                .sum();
        String summary = "You have " + active.size() + " book(s) currently checked out";
        if (overdue > 0) summary += ", " + overdue + " of which " + (overdue == 1 ? "is" : "are") + " overdue";
        summary += ".\nTotal fines: $" + String.format("%.2f", totalFines);
        return summary;
    }

    private String getFaqAnswer(String message) {
        for (Map.Entry<String, String> entry : FAQ.entrySet()) {
            if (message.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return "I don't have a specific answer for that. You can ask me about: borrowing, returning books, fines, reservations, library hours, registration, eBooks, or lost books.";
    }

    private Map<String, Object> bookToMap(Book book) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", book.getId());
        map.put("title", book.getTitle());
        map.put("author", book.getAuthor());
        map.put("isbn", book.getIsbn());
        map.put("available", book.getAvailableCopies() > 0);
        map.put("availableCopies", book.getAvailableCopies());
        map.put("averageRating", book.getAverageRating());
        return map;
    }
}
