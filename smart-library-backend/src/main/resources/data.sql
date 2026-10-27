-- Seed categories
INSERT INTO categories (name, description) VALUES ('Fiction', 'Fictional literature');
INSERT INTO categories (name, description) VALUES ('Non-Fiction', 'Non-fictional literature');
INSERT INTO categories (name, description) VALUES ('Science', 'Scientific literature');
INSERT INTO categories (name, description) VALUES ('History', 'Historical literature');
INSERT INTO categories (name, description) VALUES ('Technology', 'Technology and computing');
INSERT INTO categories (name, description) VALUES ('Arts', 'Arts and culture');

-- Seed users (password is 'password123' for all)
INSERT INTO users (email, password, full_name, role, active) VALUES
('admin@library.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin User', 'admin', true);
INSERT INTO users (email, password, full_name, role, active) VALUES
('librarian@library.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Librarian User', 'librarian', true);
INSERT INTO users (email, password, full_name, role, active) VALUES
('member@library.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Member User', 'member', true);

-- Seed books
INSERT INTO books (title, author, isbn, description, total_copies, available_copies, page_count, category_id, average_rating, rating_count) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '978-0-14-118263-6', 'A story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.', 3, 3, 180, 1, 4.5, 10);
INSERT INTO books (title, author, isbn, description, total_copies, available_copies, page_count, category_id, average_rating, rating_count) VALUES
('A Brief History of Time', 'Stephen Hawking', '978-0-55-338016-3', 'A landmark volume in science writing.', 2, 2, 256, 3, 4.0, 8);
INSERT INTO books (title, author, isbn, description, total_copies, available_copies, page_count, category_id, average_rating, rating_count) VALUES
('To Kill a Mockingbird', 'Harper Lee', '978-0-06-112008-4', 'The unforgettable novel of a childhood in a sleepy Southern town.', 2, 2, 281, 1, 5.0, 12);
INSERT INTO books (title, author, isbn, description, total_copies, available_copies, page_count, category_id, average_rating, rating_count) VALUES
('Sapiens', 'Yuval Noah Harari', '978-0-06-231609-7', 'A brief history of humankind.', 2, 2, 464, 4, 4.0, 6);
INSERT INTO books (title, author, isbn, description, total_copies, available_copies, page_count, category_id, average_rating, rating_count) VALUES
('The Art of War', 'Sun Tzu', '978-1-59-030225-5', 'Ancient Chinese military treatise.', 1, 1, 273, 4, 4.0, 5);
INSERT INTO books (title, author, isbn, description, total_copies, available_copies, page_count, category_id, average_rating, rating_count) VALUES
('1984', 'George Orwell', '978-0-45-152493-5', 'Dystopian social science fiction.', 2, 2, 328, 1, 4.5, 9);
INSERT INTO books (title, author, isbn, description, total_copies, available_copies, page_count, category_id, average_rating, rating_count) VALUES
('The Catcher in the Rye', 'J.D. Salinger', '978-0-31-676948-0', 'Story of teenage protagonist Holden Caulfield.', 1, 1, 234, 1, 3.5, 7);
