# Bookstore Application

A full-stack bookstore application with a Spring Boot backend and React frontend. The application provides book management, user authentication, loan tracking, and notifications.

## Prerequisites

Before running the application, ensure you have the following installed:

- **Java 21** or higher
- **Maven 3.6+** (or use the included Maven wrapper)
- **Node.js 16+** and **npm**
- **MariaDB 10.5+** or **MySQL 8.0+**

## Project Structure

```
kod_aplikacji/
├── backend/          # Spring Boot application
├── frontend/         # React TypeScript application
└── setup_db.sql      # Database initialization script
```

## Installation and Setup

### 1. Database Setup

First, set up the MariaDB/MySQL database:

1. Start your MariaDB/MySQL server
2. Log in as root or a user with administrative privileges:
   ```bash
   mysql -u root -p
   ```

3. Run the database setup script:
   ```bash
   mysql -u root -p < setup_db.sql
   ```

   This script will:
   - Create a database named `app`
   - Create a user `bookstore` with password `bookstore123`
   - Grant necessary privileges

**Note:** If you want to use different database credentials, you'll need to update the `backend/src/main/resources/application.yml` file accordingly.

### 2. Backend Setup

Navigate to the backend directory and run the application:

```bash
cd backend

# Option 1: Using Maven wrapper (recommended)
./mvnw spring-boot:run

# Option 2: Using system Maven
mvn spring-boot:run

# Option 3: Build and run the JAR
./mvnw clean package
java -jar target/bookstore_app-0.0.1-SNAPSHOT.jar
```

The backend server will start on **http://localhost:8080**

#### Backend Features:
- REST API for book management
- JWT-based authentication and authorization
- Spring Security integration
- JPA/Hibernate for database operations
- Automatic database schema generation

### 3. Frontend Setup

In a new terminal window, navigate to the frontend directory:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend application will start on **http://localhost:3000**

The application will automatically open in your default browser.

### 4. Creating an Administrator Account

The application has two user roles with different permissions:

| Role | Value | Permissions |
|------|-------|-------------|
| **USER** | 0 | Can add books (require admin approval before being published) |
| **ADMIN** | 1 | Books are automatically published, access to admin panel |

**Important:** By default, all registered users have the USER role. To fully test the application (add and publish books immediately), you need an administrator account.

#### Option 1: Create Admin Account via Database

After registering a regular user account, promote it to admin:

```bash
# Log into MariaDB
mariadb -u bookstore -pbookstore123 app

# Change user role to admin (replace email with your registered email)
UPDATE user SET role = 1 WHERE email = 'your-email@example.com';

# Verify the change
SELECT id, email, first_name, last_name, role FROM user;

# Exit
exit
```

After changing the role, **log out and log back in** to the application for the changes to take effect.

#### Option 2: Manually Publish Books

If you're using a regular USER account, you can manually publish books via database:

```bash
mariadb -u bookstore -pbookstore123 app -e "UPDATE book SET is_published = 1 WHERE is_published = 0;"
```

#### Testing the Application

Once you have an admin account:

1. **Log in** with your admin credentials
2. **Add a book** - it will be automatically published and visible in the book list
3. **Borrow a book** - navigate to the book details and request a loan
4. **View your loans** - check the "My Loans" section

## Application Features

- **User Authentication**: Register and login with JWT tokens
- **Role-Based Access Control**: 
  - Regular users can add books (require admin approval)
  - Administrators can publish books immediately
- **Book Management**: Browse, search, and view book details
- **Loan System**: Borrow and return books with due date tracking
- **User Dashboard**: View personal loans and notifications
- **Admin Panel**: Approve/reject book submissions, manage users and loans
- **Multi-language Support**: Polish, Ukrainian, and English
- **Dark Mode**: Toggle between light and dark themes

## Default Configuration

### Backend Configuration
- **Port**: 8080
- **Database URL**: `jdbc:mariadb://localhost:3306/app`
- **Database User**: `bookstore`
- **Database Password**: `bookstore123`

### Frontend Configuration
- **Port**: 3000
- **API Base URL**: `http://localhost:8080` (configured in the application)

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify MariaDB/MySQL is running:
   ```bash
   sudo systemctl status mariadb
   # or
   sudo systemctl status mysql
   ```

2. Check database credentials in `backend/src/main/resources/application.yml`

3. Ensure the `bookstore` user has proper permissions:
   ```sql
   GRANT ALL PRIVILEGES ON app.* TO 'bookstore'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Port Already in Use

If port 8080 or 3000 is already in use:

- **Backend**: Change the port in `application.yml`:
  ```yaml
  server:
    port: 8081
  ```

- **Frontend**: Set the PORT environment variable:
  ```bash
  PORT=3001 npm start
  ```

### Java Version Issues

Ensure you're using Java 21:
```bash
java -version
```

If you have multiple Java versions, set `JAVA_HOME` to Java 21:
```bash
export JAVA_HOME=/path/to/java21
```

### Maven Wrapper Permissions

If you get permission errors with `mvnw`:
```bash
chmod +x mvnw
```

## Project Technologies

### Backend
- Spring Boot 3.2.3
- Spring Security with JWT
- Spring Data JPA
- MariaDB
- Lombok
- Maven

### Frontend
- React 18
- TypeScript
- Material-UI (MUI)
- React Router
- Axios
- i18next (internationalization)
- JWT authentication

## API Documentation

Once the backend is running, you can access:
- **Health Check**: http://localhost:8080/actuator/health
- **API Endpoints**: The application uses RESTful API endpoints (documentation can be added with Swagger/OpenAPI if needed)

## Notes

- The application uses JWT tokens for authentication with:
  - Access token expiration: 15 minutes (900,000 ms)
  - Refresh token expiration: 24 hours (86,400,000 ms)
- The database schema is automatically created/updated by Hibernate
- Sample data is loaded from `backend/src/main/resources/data.sql` on startup
- File uploads are limited to 30MB
