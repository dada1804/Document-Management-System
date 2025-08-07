# Document Management System

A Spring Boot application for managing documents with user authentication and file storage.

## Features

- **User Authentication**: JWT-based authentication with user registration and login
- **Document Management**: Upload, download, update, and delete documents
- **File Storage**: Files are stored as base64 encoded strings in MongoDB
- **Access Control**: Public documents and private documents with user-specific access
- **Search**: Search documents by filename, description, or tags
- **Statistics**: Get document statistics for users

## Architecture

- **Backend**: Spring Boot with Spring Security and JWT
- **Database**: PostgreSQL for user data, MongoDB for document storage
- **File Storage**: Base64 encoded content stored directly in MongoDB
- **Frontend**: Angular application (separate repository)

## File Storage Approach

Files are converted to base64 strings and stored directly in the MongoDB database. This approach:
- Eliminates the need for file system storage
- Provides atomic operations for file uploads
- Simplifies backup and deployment
- Reduces complexity in file path management

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Documents
- `POST /api/documents/upload` - Upload a document
- `GET /api/documents/{id}` - Get document metadata
- `GET /api/documents/{id}/content` - Get document base64 content
- `GET /api/documents/download/{id}` - Download document
- `GET /api/documents/my-documents` - Get user's documents
- `GET /api/documents/public` - Get public documents
- `GET /api/documents/accessible` - Get accessible documents
- `GET /api/documents/search` - Search documents
- `PUT /api/documents/{id}` - Update document
- `DELETE /api/documents/{id}` - Delete document
- `GET /api/documents/stats` - Get document statistics

## Setup

1. **Prerequisites**
   - Docker and Docker Compose
   - Java 17+
   - Maven

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Backend API: http://localhost:8080
   - Frontend: http://localhost:4200

## Configuration

The application uses the following configuration:
- PostgreSQL: User data storage
- MongoDB: Document storage with base64 content
- JWT: Authentication tokens
- File size limit: 100MB
- Supported file types: pdf, doc, docx, txt, jpg, jpeg, png, gif, zip, rar

## Development

To run the application in development mode:
```bash
mvn spring-boot:run
```

The application will start on port 8080 with hot reload enabled. 