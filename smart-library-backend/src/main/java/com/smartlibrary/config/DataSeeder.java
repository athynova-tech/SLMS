package com.smartlibrary.config;

import com.smartlibrary.model.*;
import com.smartlibrary.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final EBookRepository ebookRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      CategoryRepository categoryRepository,
                      BookRepository bookRepository,
                      EBookRepository ebookRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.bookRepository = bookRepository;
        this.ebookRepository = ebookRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Already seeded
        }

        // Seed categories
        Category fiction = createCategory("Fiction", "Fictional literature");
        Category nonFiction = createCategory("Non-Fiction", "Non-fictional literature");
        Category science = createCategory("Science", "Scientific literature");
        Category history = createCategory("History", "Historical literature");
        Category technology = createCategory("Technology", "Technology and computing");
        Category arts = createCategory("Arts", "Arts and culture");

        // Seed users
        User admin = createUser("admin@library.com", "password123", "Admin User", Role.admin);
        User librarian = createUser("librarian@library.com", "password123", "Librarian User", Role.librarian);
        User member = createUser("member@library.com", "password123", "Member User", Role.member);

        // Seed books
        Book gatsby = createBook("The Great Gatsby", "F. Scott Fitzgerald", "978-0-14-118263-6",
                "A story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
                3, 3, 180, fiction, 4.5, 10);
        Book briefHistory = createBook("A Brief History of Time", "Stephen Hawking", "978-0-55-338016-3",
                "A landmark volume in science writing.", 2, 2, 256, science, 4.0, 8);
        Book mockingbird = createBook("To Kill a Mockingbird", "Harper Lee", "978-0-06-112008-4",
                "The unforgettable novel of a childhood in a sleepy Southern town.", 2, 2, 281, fiction, 5.0, 12);
        Book sapiens = createBook("Sapiens", "Yuval Noah Harari", "978-0-06-231609-7",
                "A brief history of humankind.", 2, 2, 464, history, 4.0, 6);
        Book artOfWar = createBook("The Art of War", "Sun Tzu", "978-1-59-030225-5",
                "Ancient Chinese military treatise.", 1, 1, 273, history, 4.0, 5);
        Book nineteen84 = createBook("1984", "George Orwell", "978-0-45-152493-5",
                "Dystopian social science fiction.", 2, 2, 328, fiction, 4.5, 9);
        Book catcher = createBook("The Catcher in the Rye", "J.D. Salinger", "978-0-31-676948-0",
                "Story of teenage protagonist Holden Caulfield.", 1, 1, 234, fiction, 3.5, 7);

        // Seed e-books (one per seeded book)
        createEbook(gatsby, "The Great Gatsby (E-Book)", "pdfs/great-gatsby.pdf", 180, 214, admin);
        createEbook(briefHistory, "A Brief History of Time (E-Book)", "pdfs/brief-history-of-time.pdf", 256, 168, admin);
        createEbook(mockingbird, "To Kill a Mockingbird (E-Book)", "pdfs/mockingbird.pdf", 281, 342, librarian);
        createEbook(sapiens, "Sapiens (E-Book)", "pdfs/sapiens.pdf", 464, 97, librarian);
        createEbook(artOfWar, "The Art of War (E-Book)", "pdfs/art-of-war.pdf", 273, 512, admin);
        createEbook(nineteen84, "1984 (E-Book)", "epubs/1984.epub", 328, 268, librarian);
        createEbook(catcher, "The Catcher in the Rye (E-Book)", "epubs/catcher-in-the-rye.epub", 234, 421, admin);
    }

    private EBook createEbook(Book book, String title, String filePath, int totalPages, int downloadCount, User uploader) {
        EBook ebook = new EBook();
        ebook.setTitle(title);
        ebook.setBook(book);
        ebook.setUploadedBy(uploader);
        ebook.setFilePath(filePath);
        ebook.setTotalPages(totalPages);
        ebook.setDownloadCount(downloadCount);
        return ebookRepository.save(ebook);
    }

    private Category createCategory(String name, String description) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        return categoryRepository.save(category);
    }

    private User createUser(String email, String password, String fullName, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setRole(role);
        user.setActive(true);
        return userRepository.save(user);
    }

    private Book createBook(String title, String author, String isbn, String description,
                           int totalCopies, int availableCopies, int pageCount,
                           Category category, double avgRating, int ratingCount) {
        Book book = new Book();
        book.setTitle(title);
        book.setAuthor(author);
        book.setIsbn(isbn);
        book.setDescription(description);
        book.setTotalCopies(totalCopies);
        book.setAvailableCopies(availableCopies);
        book.setPageCount(pageCount);
        book.setCategory(category);
        book.setAverageRating(avgRating);
        book.setRatingCount(ratingCount);
        return bookRepository.save(book);
    }
}
