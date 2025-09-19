ANDAL, KASSANDRA CRIZEL M.
BSIS 3A


 Student Enrollment System 

The Student Enrollment System is a dynamic web-based application developed using PHP (with PDO) for the backend and vanilla JavaScript for the frontend. It is designed to manage student information and their related data, such as academic programs, school years, semesters, subjects, and enrollments. This system supports full CRUD (Create, Read, Update, Delete) operations across all entities, and utilizes JavaScript's fetch() API along with async/await for seamless and asynchronous interactions with the server—resulting in a smooth user experience without page reloads.

The backend is built using PHP with PDO, ensuring secure database operations via prepared statements. Each API returns consistent JSON responses, including success flags, messages, and relevant data payloads. The frontend dynamically renders and updates data tables and modals using plain JavaScript and DOM manipulation, keeping dependencies minimal and performance optimal.

To set up the project, you’ll need a local development environment with PHP, MySQL, and a web server like Apache (such as via XAMPP, WAMP, or MAMP). After cloning or downloading the project, you must import the provided SQL file into your MySQL server using phpMyAdmin or any database tool of your choice. This will create the required database and tables, such as students, programs, subjects, semesters, years, and enrollments.

Next, you need to configure the database connection. Inside the api/config/database.php file, update the database name, username, and password to match your local MySQL credentials. Once configured, start your Apache and MySQL services, place the project inside your server's root directory (e.g., htdocs/ for XAMPP), and access the system by navigating to http://localhost/enrollment-system-crud-Andal/ in your browser.

The folder structure is organized into separate folders for each entity, with API endpoints such as getStudents.php, addStudent.php, updateStudent.php, and deleteStudent.php. Similar files exist for Programs, Years & Semesters, Subjects, and Enrollments, making the code modular and maintainable. Each API uses secure and optimized PDO queries to interact with the database.

On the frontend, the application is divided into dashboard sections for Students, Programs, Years & Semesters, Subjects, and Enrollments. Each section displays a data table with buttons to add, edit, or delete records. Forms are handled using modals and submitted asynchronously using the Fetch API. The system also handles validation errors, loading states, and constraints gracefully.

As stretch goals, the system could be extended to support features like search and filtering (e.g., view students by program), pagination for large datasets, input validation messages, and loading indicators. Authentication and role-based access control could also be implemented for enhanced security.

This project demonstrates how to build a full-featured CRUD system using PHP and JavaScript, while practicing asynchronous programming, modular design, and secure coding practices. It is ideal for educational purposes or as a base for more complex school management systems.
