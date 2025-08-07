# Document Management System - Frontend

A modern Angular frontend for the Document Management System with Material Design UI, JWT authentication, and comprehensive document management features.

## 🚀 Features

### Authentication & User Management
- **User Registration** - Create new accounts with validation
- **User Login** - Secure authentication with JWT tokens
- **Profile Management** - View and manage user profile
- **Role-based Access Control** - Different permissions for different user roles

### Document Management
- **File Upload** - Drag & drop file upload with validation
- **Document List** - View all user documents with search and filtering
- **Document Details** - View detailed document information
- **File Download** - Download documents with progress tracking
- **Document Search** - Search by filename, description, and tags
- **Access Control** - Public and private document management

### User Interface
- **Modern Material Design** - Beautiful and responsive UI
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Dark/Light Theme** - Customizable theme support
- **Loading States** - Smooth loading indicators
- **Toast Notifications** - User-friendly feedback messages

## 🛠 Technology Stack

- **Framework**: Angular 17 (Standalone Components)
- **UI Library**: Angular Material 17
- **Styling**: SCSS with Material Design
- **State Management**: RxJS Observables
- **HTTP Client**: Angular HttpClient with Interceptors
- **Authentication**: JWT Token-based
- **Notifications**: ngx-toastr
- **File Handling**: Native File API with drag & drop

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Angular CLI** 17+
- **Backend API** running (Spring Boot application)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Update `src/environments/environment.ts` with your backend API URL:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'  // Update this to your backend URL
};
```

### 3. Start Development Server

```bash
npm start
```

The application will be available at `http://localhost:4200`

### 4. Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                    # Core functionality
│   │   ├── guards/             # Route guards
│   │   ├── interceptors/       # HTTP interceptors
│   │   └── services/           # Shared services
│   ├── features/               # Feature modules
│   │   ├── auth/              # Authentication
│   │   ├── dashboard/         # Dashboard
│   │   ├── documents/         # Document management
│   │   └── profile/           # User profile
│   ├── app.component.ts       # Main app component
│   ├── app.config.ts          # App configuration
│   └── app.routes.ts          # Main routing
├── environments/               # Environment configurations
└── styles.scss                # Global styles
```

## 🔧 Configuration

### Environment Variables

- `apiUrl`: Backend API base URL
- `production`: Production mode flag

### Material Design Theme

The application uses Angular Material's indigo-pink theme by default. You can customize it in `angular.json`:

```json
"styles": [
  "@angular/material/prebuilt-themes/indigo-pink.css",
  "src/styles.scss"
]
```

## 📱 Features in Detail

### Authentication Flow

1. **Registration**: Users can create accounts with username, email, and password
2. **Login**: Secure authentication with JWT token storage
3. **Token Management**: Automatic token refresh and storage
4. **Route Protection**: Guards protect authenticated routes

### Document Upload

- **Drag & Drop**: Intuitive file upload interface
- **File Validation**: Size and type validation
- **Progress Tracking**: Upload progress indicators
- **Metadata**: Add description, tags, and access settings

### Document Management

- **List View**: Paginated document list with search
- **Grid View**: Alternative document display
- **Search & Filter**: Advanced search capabilities
- **Bulk Operations**: Select multiple documents

### Access Control

- **Public Documents**: Accessible to all users
- **Private Documents**: Only accessible to owner
- **Shared Documents**: Accessible to specific users
- **Role-based Permissions**: Admin, Moderator, User roles

## 🎨 UI Components

### Material Design Components Used

- **Cards**: Document display and forms
- **Buttons**: Actions and navigation
- **Form Fields**: Input validation and styling
- **Lists**: Document lists and navigation
- **Dialogs**: Confirmation and detail views
- **Progress Indicators**: Loading states
- **Snackbars**: User notifications
- **Menus**: Context menus and navigation

### Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Flexible Layout**: Adapts to different screen sizes
- **Touch Friendly**: Optimized for touch interactions
- **Accessibility**: WCAG compliant design

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Route Guards**: Protected routes
- **HTTP Interceptors**: Automatic token injection
- **Input Validation**: Client-side validation
- **XSS Protection**: Angular's built-in protection
- **CSRF Protection**: Backend handles CSRF

## 📊 State Management

- **Observables**: Reactive state management
- **Services**: Centralized data management
- **Local Storage**: Persistent user preferences
- **Session Management**: Automatic token handling

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run e2e
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Docker Deployment

```dockerfile
FROM nginx:alpine
COPY dist/dms-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Configuration

For production, update `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api'
};
```

## 🔧 Development

### Code Style

- **TypeScript**: Strict type checking
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Angular Style Guide**: Follow Angular best practices

### Git Workflow

1. Create feature branch
2. Make changes
3. Run tests
4. Submit pull request
5. Code review
6. Merge to main

## 📈 Performance

### Optimization Features

- **Lazy Loading**: Feature modules loaded on demand
- **Tree Shaking**: Unused code elimination
- **Bundle Optimization**: Optimized build output
- **Caching**: HTTP response caching
- **Compression**: Gzip compression

### Performance Monitoring

- **Bundle Analyzer**: Analyze bundle size
- **Lighthouse**: Performance auditing
- **Core Web Vitals**: Performance metrics

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend allows frontend origin
2. **JWT Token Issues**: Check token expiration and format
3. **File Upload Failures**: Verify file size and type limits
4. **Build Errors**: Clear node_modules and reinstall

### Debug Mode

Enable debug logging in development:

```typescript
// In environment.ts
export const environment = {
  production: false,
  debug: true,
  apiUrl: 'http://localhost:8080/api'
};
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting guide

## 🔄 Updates

### Version History

- **v1.0.0**: Initial release with core features
- **v1.1.0**: Added search and filtering
- **v1.2.0**: Enhanced UI and performance

### Upcoming Features

- **Document Preview**: In-browser document viewing
- **Advanced Search**: Full-text search capabilities
- **Bulk Operations**: Multi-document management
- **Version Control**: Document versioning
- **Collaboration**: Real-time collaboration features 