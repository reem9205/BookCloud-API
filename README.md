

# book cloud

> Virtual Bookshelf Organizer is a client- server application designed to help users manage and organize their personal collection of book in an organized interactive, efficient, and visually appealing way. 

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [API Endpoints](#api-endpoints)
  - [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Dependencies](#Dependencies)
-[key Features](#key-features)
-[database](#database)
-[views](#views)

---

## Getting Started

This Node.js API provides [storing books virtually in a simple 
organized way]. Follow the guide below to set up, run, and deploy the API.

### Prerequisites

- **Node.js** version >= 22.0
- **npm** version >= 6.0
- **MySQLDB**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/reem9205/project.git

   ```
   
   ### Dependencies
body-parser - Middleware to parse incoming request bodies.
cors - Express middleware for enabling CORS (Cross-Origin Resource Sharing).
dotenv - Module to load environment variables from a .env file.
express - Web application framework for Node.js.
express-validator - Middleware for request validation in Express.
moment - Library for handling dates and times in JavaScript.
mysql2 - MySQL library for Node.js.
nodemon - Utility to monitor changes in your Node.js application and automatically restart the server.

### API Endpoints

Bookshelf API
GET /api/bookshelves - Get all bookshelves
POST /api/bookshelves - Create a new bookshelf
GET /api/bookshelves/:id - Get a specific bookshelf by ID
PUT /api/bookshelves/:id - Update a specific bookshelf
DELETE /api/bookshelves/:id - Delete a specific bookshelf

Books API
GET /api/books - Get all books
POST /api/books - Add a new book
GET /api/books/:id - Get a book by ID
PUT /api/books/:id - Update a book
DELETE /api/books/:id - Delete a book

Genre API
GET /api/genres - Get all genres
POST /api/genres - Create a new genre
GET /api/genres/:id - Get a specific genre by ID
PUT /api/genres/:id - Update a specific genre
DELETE /api/genres/:id - Delete a specific genre

User API
GET /api/users - Get all users
POST /api/users - Create a new user
GET /api/users/:id - Get a specific user by ID
PUT /api/users/:id - Update a specific user
DELETE /api/users/:id - Delete a specific user

Review API
GET /api/reviews - Get all reviews
POST /api/reviews - Create a new review
GET /api/reviews/:id - Get a specific review by ID
PUT /api/reviews/:id - Update a specific review
DELETE /api/reviews/:id - Delete a specific review

### Environment Variables

#Mysql database configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME= virtuallibrary
DB_PORT=3307

#server configuration
PORT = 3000

### usage
Virtual Bookshelf Organizer is a client- server application designed to help users manage and organize their personal collection of book in an organized interactive, efficient, and visually appealing way. A 2021 survey by Digital Reading Solutions revealed that over 60% of users find it challenging to maintain a clear system for managing digital content, this application solves this issue by provides innovative tools that simplify organizing and tacking their books by categorizing them on an virtual bookshelf making them easily accessible at any given time without wasting the user time searching through their collection . The user can add, organize, delete, filter their books in a seamless interface consisting of many attributes. The user can filter and implement advanced search through many aspects such as authors, genres, and reading status. Evidently, by organizing digital libraries more effectively, the Virtual Bookshelf Organizer can enhance user engagement with reading materials, making a unavoidable effective tools for avid readers. The project aligns with current trends in digital literacy and resource management.

### key features 
1.	Adding Books: users can manually add books to their virtual shelfs by inputting the book title, author, published date, genre, and a brief description.
2.	Organizing Books: users can organize their shelf as they please. For example a shelf can be orgazing by specific author, genre, or by custom made labels (Favorites, Top 5…).
3.	Drag-and-Drop Functionality: Drag-and-Drop functionality: Users will be able to reorganize book covers or titles on their virtual shelves using the application's user-friendly drag-and-drop interface. Users can now interactively and visually customize their collection.
4.	Tracking Reading Progress: user can input their current reading status on each book as (read, to read, and currently reading). Additionally, users can track their percentage by regularly updating their current page status.
5.	Search and Filtering: Users will be able to search through their library of books and apply filters according to genre, author, year of publication, or current reading state. This improves usability, particularly for those who have a lot of books.

6.	Multiple Bookshelves and User Accounts: Since each user will have an account, they can arrange books however they see fit and construct as many virtual bookshelves as they'd like. To manage their bookshelves, examine their collection, and change library settings, users must log in.

Book Recommendations: The software analyzes access the reader current book preference by analyze recently read books author and genre to recommend from the unread books what to read next.

### testing
Endpoint availability and response validation.
CRUD operations for each API resource.
Input validation checks.
Authorization and error handling cases.
Edge cases, such as invalid IDs or missing required fields.

### Contributing

We welcome contributions to improve this project! Please follow the guidelines below if you would like to contribute:

1. **Fork the Repository**: Click on "Fork" at the top of the repository page to create a personal copy of the project.

2. **Clone the Forked Repository**: Clone the repository to your local machine.
   ```bash
    git clone https://github.com/reem9205/project.git

### License

This project is licensed under the MIT License. This means you are free to use, modify, and distribute the code with proper attribution. See the [LICENSE](LICENSE) file for more details.

### Database Schema Description

The database for the Virtual Bookshelf Organizer API is named `virtuallibrary` and consists of the following tables:

#### Tables

1. **author**
   - Stores information about authors.
   - Columns:
     - `author_id` - Primary key, unique identifier for each author.
     - Other columns may include `first_name`, `last_name`, and additional author details.

2. **book**
   - Stores information about each book.
   - Columns:
     - `book_id` - Primary key, unique identifier for each book.
     - `title` - Title of the book.
     - `ISBN` - ISBN number of the book.
     - `language` - Language in which the book is written.
     - `date_published` - Publication date of the book.
     - `page_count` - Total number of pages.
     - `description` - Description or summary of the book.
     - `author_id` - Foreign key linking to the `author` table.

3. **bookgenre**
   - Manages many-to-many relationships between books and genres.
   - Columns:
     - `book_id` - Foreign key linking to the `book` table.
     - `genre_id` - Foreign key linking to the `genre` table.

4. **booksbyuser**
   - Stores information on books assigned to users.
   - Columns:
     - `book_user_id` - Primary key, unique identifier for each record.
     - `user_id` - Foreign key linking to the `user` table.
     - `book_id` - Foreign key linking to the `book` table.
     - `status` - Status of the book for the user (e.g., reading, read, unread).
     - `start_date` - Date when the user started reading.
     - `end_date` - Date when the user finished reading.
     - `current_page` - The current page the user is on.

5. **bookshelf**
   - Stores information about user-created bookshelves.
   - Columns:
     - `bookshelf_id` - Primary key, unique identifier for each bookshelf.
     - `user_id` - Foreign key linking to the `user` table.
     - `bookshelf_name` - Name of the bookshelf.
     - `creation_date` - Date when the bookshelf was created.
     - `view` - Privacy setting of the bookshelf (e.g., public or private).

6. **bookshelf_books**
   - Manages many-to-many relationships between bookshelves and books.
   - Columns:
     - `bookshelf_id` - Foreign key linking to the `bookshelf` table.
     - `book_id` - Foreign key linking to the `book` table.

7. **genre**
   - Stores information about different genres.
   - Columns:
     - `genre_id` - Primary key, unique identifier for each genre.
     - `genre_name` - Name of the genre.

8. **image**
   - Stores images related to books or users.
   - Columns:
     - `image_id` - Primary key, unique identifier for each image.
     - `file_path` - File path or URL for accessing the image.

9. **profile**
   - Stores user profile information.
   - Columns:
     - `profile_id` - Primary key, unique identifier for each profile.
     - `bio` - Biography or description of the user.
     - `picture` - Profile picture of the user.

10. **review**
    - Stores reviews given by users for books.
    - Columns:
      - `review_id` - Primary key, unique identifier for each review.
      - `book_id` - Foreign key linking to the `book` table.
      - `user_id` - Foreign key linking to the `user` table.
      - `title` - Title of the review.
      - `date` - Date when the review was posted.
      - `description` - Detailed review content.
      - `rating` - Rating given by the user.

11. **user**
    - Stores information about users.
    - Columns:
      - `user_id` - Primary key, unique identifier for each user.
      - `username` - Unique username for the user.
      - Other columns may include email, password, and additional user details.

#### Relationships

- Each `book` is linked to an `author` and can belong to multiple `genres` (through the `bookgenre` table).
- Each `bookshelf` can contain multiple `books` (through the `bookshelf_books` table).
- Each `user` can have multiple `bookshelves` and may leave multiple `reviews` for different `books`.
- Each `book` can have multiple `reviews` written by different `users`.

This schema allows for flexible relationships between users, books, genres, and bookshelves, supporting the functionalities of the Virtual Bookshelf Organizer API.

### Views

1. **Homepage**  
   **Purpose:** Acts as the entry point for all users.  
   **Features:**  
   - Flipbook interaction to browse books interactively.  
   - Sign-in and sign-up buttons for authentication.  

2. **Dashboard**  
   **Purpose:** Displays the user’s bookshelves with management options.  
   **Features:**  
   - List or grid view of bookshelves.  
   - Options to edit or delete bookshelves.  

3. **Header**  
   **Purpose:** Provides navigation across main sections and quick actions.  
   **Features:**  
   - Navigation links (e.g., Homepage, Dashboard, Search).  
   - A "Create Bookshelf" button.  
   - A settings icon for user options.  

4. **Settings**  
   **Purpose:** Displays user profile information with action options.  
   **Features:**  
   - View user information (e.g., username, email).  
   - Options: Edit, Logout, Delete Account.  

5. **Edit Settings**  
   **Purpose:** Allows users to update their profile details and profile picture.  
   **Features:**  
   - Form to update username, email, and password.  
   - Section to upload and update profile image.  

6. **Footer**  
   **Purpose:** Displays summary stats and additional tools.  
   **Features:**  
   - Total books in collection.  
   - Total books read.  
   - A pen icon to add a book.  

7. **Add Book**  
   **Purpose:** Allows users to add books to the global database and their personal collection.  
   **Features:**  
   - Form to input book details (e.g., title, author, genre, ISBN).  
   - Option to add the book to the user’s collection directly.  

8. **Edit Bookshelf**  
   **Purpose:** Lets users manage the contents and settings of their bookshelves.  
   **Features:**  
   - Add or delete books from a bookshelf.  
   - Update bookshelf visibility (e.g., Public/Private).  
   - Rename or delete the bookshelf.  

9. **Books**  
   **Purpose:** Displays all books across all users.  
   **Features:**  
   - Option to add books to the user’s collection.  
   - On clicking a book, show detailed information.  

10. **My Collection**  
    **Purpose:** Displays books specific to the logged-in user.  
    **Features:**  
    - Book details specific to the user (e.g., reading status, notes).  
    - Option to manage the user’s private data for each book.  

11. **Reviews**  
    **Purpose:** Displays user-generated reviews with filtering options.  
    **Features:**  
    - Option to filter reviews by title and rating.  

12. **Search**  
    **Purpose:** Provides advanced search capabilities across the book database.  
    **Features:**  
    - Filter books by title, genre, or author.  
    - Display results dynamically as the user types.  

13. **Edit Book**  
    **Purpose:** Allows users to update their personal information for a book.  
    **Features:**  
    - Change details like the current page or reading status.  

14. **Current Book**  
    **Purpose:** Displays books marked as "currently reading" for a user.  
    **Features:**  
    - Progress bar to track reading completion.  

15. **Other People**  
    **Purpose:** Displays profiles of other users.  
    **Features:**  
    - Shows public bookshelves and bio of the selected user.  

16. **Recommendation View**  
    **Purpose:** Displays book recommendations based on user preferences.  
    **Features:**  
    - Recommends books by genre or author.  

17. **Sign Up**  
    **Purpose:** Allows users to create an account.  
    **Features:**  
    - Collects all necessary user information for registration.