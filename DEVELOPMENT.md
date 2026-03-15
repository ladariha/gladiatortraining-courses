# Development Guide

This guide covers setting up the development environment, contributing to the project, and understanding the development workflow.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Build Process](#build-process)
- [Testing](#testing)
- [Code Style](#code-style)
- [Contributing](#contributing)
- [Debugging](#debugging)

## Prerequisites

### System Requirements

- **PHP**: 7.4 or higher
- **WordPress**: 5.0 or higher
- **Node.js**: 16.x or higher
- **Yarn**: Latest stable version
- **MySQL**: 5.6 or higher
- **Web Server**: Apache or Nginx

### Development Tools

- **Code Editor**: VSCode recommended with extensions:
  - PHP Intelephense
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - WordPress Snippets
- **Browser**: Chrome/Firefox with React Developer Tools
- **Database**: phpMyAdmin or similar for database inspection
- **Git**: Version control system

## Development Setup

### 1. WordPress Development Environment

Set up a local WordPress development environment using:

#### Option A: Local WordPress Installation
```bash
# Using wp-cli
wp core download
wp config create --dbname=gladiator_dev --dbuser=root --dbpass=password
wp core install --url=http://localhost/gladiator --title="Gladiator Dev" --admin_user=admin --admin_password=admin --admin_email=admin@example.com
```

#### Option B: Docker Setup
```bash
# Using docker-compose
version: '3.8'
services:
  wordpress:
    image: wordpress:latest
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - ./:/var/www/html/wp-content/plugins/gladiatortraining-courses
  db:
    image: mysql:5.7
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress
      MYSQL_ROOT_PASSWORD: rootpassword
```

### 2. Plugin Setup

1. **Clone the Repository**:
```bash
git clone https://github.com/ladariha/gladiatortraining-courses.git
cd gladiatortraining-courses
```

2. **Install Plugin in WordPress**:
```bash
# Symlink to WordPress plugins directory
ln -s /path/to/gladiatortraining-courses /path/to/wordpress/wp-content/plugins/
```

3. **Install Frontend Dependencies**:
```bash
cd frontend
yarn install
```

### 3. Database Setup

The plugin automatically creates necessary tables when activated. For development, you might want to add test data:

## Project Structure

### Backend (PHP)

```
includes/
├── class-*.php              # WordPress integration classes
├── *Route.php               # REST API endpoints
├── Persistance.php          # Database layer
├── MailService.php          # Email functionality
├── Utils.php                # Utility functions
└── ErrorsUtils.php          # Error handling
```

### Frontend (React/TypeScript)

```
frontend
```

## Development Workflow

### 1. Frontend Development

Start the development server for hot reloading:

```bash
cd frontend
yarn start
```

This starts the React development server at `http://localhost:3000`. However, since the app is integrated with WordPress, you'll need to:

1. Build the frontend for WordPress integration:
```bash
yarn bundle
```

2. Or use the watch mode for continuous building:
```bash
# Add this script to package.json
"watch": "craco build --watch"
yarn watch
```

### 2. Backend Development

For PHP backend changes:

1. **Enable WordPress Debug Mode** in `wp-config.php`:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

2. **Check Error Logs**:
```bash
tail -f wp-content/debug.log
```

3. **Use WordPress Developer Tools**:
   - Query Monitor plugin for debugging
   - WordPress CLI for testing

### 3. Testing Changes

1. **Frontend Changes**:
   - Test in browser with React DevTools
   - Check console for JavaScript errors
   - Verify API calls in Network tab

2. **Backend Changes**:
   - Test REST endpoints directly
   - Check database changes
   - Verify error logging

3. **Integration Testing**:
   - Test complete user flows
   - Verify admin vs. public access
   - Test on different WordPress themes

## Build Process

### Development Build

For development with source maps and debugging:

```bash
cd frontend
yarn bundle
```

### Production Build

For optimized production deployment:

```bash
# Full production build with version increment
MAIL_API_KEY='your_production_api_key' ./build.sh
```

The build process:
1. Increments plugin version
2. Installs frontend dependencies
3. Builds optimized React bundle
4. Copies all necessary files
5. Creates distribution ZIP
6. Cleans up temporary files

### Manual Build Steps

If you need to build manually:

```bash
# Frontend build
cd frontend
yarn install
yarn bundleProd

# Copy files to dist
cd ..
mkdir -p dist/frontend/build
cp -R admin dist/admin
cp -R includes dist/includes
cp -R languages dist/languages
cp -R public dist/public
cp *.php dist/
cp -R frontend/build/* dist/frontend/build/

# Remove source maps
find dist/frontend -name "*.map" -delete

# Create ZIP
cd dist
zip -r ../gladiatortraining-courses.zip *
```

## Testing

### Current Testing Status

The project currently has limited automated testing. Here's what should be implemented:

### Frontend Testing

Add these test scripts to `frontend/package.json`:

```bash
# Unit tests
yarn test

# Component tests
yarn test --coverage

# End-to-end tests (would need to be added)
yarn test:e2e
```

### Suggested Test Structure

```
frontend/src/
├── __tests__/               # Unit tests
│   ├── components/
│   ├── hooks/
│   └── utils/
├── __integration__/         # Integration tests
└── __e2e__/                # End-to-end tests
```

### Manual Testing Checklist

- [ ] Plugin activation/deactivation
- [ ] Event creation and editing
- [ ] Registration process (individual and group)
- [ ] Payment status updates
- [ ] Email notifications
- [ ] Permission checks (admin vs. visitor)
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

## Code Style

### PHP Code Style

Follow WordPress Coding Standards:

```php
<?php
// Use proper WordPress hooks
add_action('init', 'my_function');

// Sanitize input
$safe_data = sanitize_text_field($_POST['user_input']);

// Escape output
echo esc_html($user_data);

// Use WordPress database methods
global $wpdb;
$result = $wpdb->get_results($wpdb->prepare("SELECT * FROM table WHERE id = %d", $id));
```

### Frontend Code Style

The project uses ESLint and Prettier:

```bash
# Lint code
cd frontend
yarn lint

# Fix linting issues
yarn lint:fix

# Format code
npx prettier --write "src/**/*.{js,jsx,ts,tsx}"
```

### TypeScript Standards

```typescript
// Use proper typing
interface EventData {
    id: number;
    name: string;
    description: string;
}

// Avoid any type
const handleEvent = (event: EventData): void => {
    // Implementation
};

// Use proper imports
import type { FC } from 'react';
import { useState, useEffect } from 'react';
```

## Contributing

### Branching Strategy

- `main` - Production ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Critical fixes

### Commit Message Format

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: frontend, backend, api, build, etc.

Examples:
feat(frontend): add event registration form
fix(api): resolve registration validation issue
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create Feature Branch**:
```bash
git checkout -b feature/new-feature-name
```

2. **Make Changes**:
   - Follow code style guidelines
   - Add tests if applicable
   - Update documentation

3. **Test Changes**:
   - Run linting and formatting
   - Test functionality thoroughly
   - Verify no breaking changes

4. **Submit Pull Request**:
   - Clear title and description
   - Reference any related issues
   - Include testing instructions

## Debugging

### Frontend Debugging

1. **React DevTools**: Install browser extension
2. **Console Logging**:
```javascript
console.log('Debug info:', data);
console.error('Error occurred:', error);
```

3. **Network Tab**: Monitor API calls
4. **Source Maps**: Available in development build

### Backend Debugging

1. **WordPress Debug Log**:
```php
error_log('Debug message: ' . print_r($data, true));
```

2. **Query Monitor**: Install WordPress plugin
3. **Direct API Testing**:
```bash
curl -X GET "http://localhost/wp-json/gtevents/v1/events" \
  -H "Content-Type: application/json"
```

### Database Debugging

1. **Direct Database Access**:
```sql
-- Check event data
SELECT * FROM wp_gtevents_events WHERE visible = 1;

-- Check registrations
SELECT r.*, g.event_id FROM wp_gtevents_registrations r
JOIN wp_gtevents_registration_group g ON r.group_id = g.id;
```

2. **WordPress Database Queries**:
```php
global $wpdb;
$wpdb->show_errors(); // Enable error display
```

### Common Issues

1. **Build Failures**:
   - Check Node.js version compatibility
   - Clear node_modules and reinstall
   - Verify Yarn version

2. **API Errors**:
   - Check WordPress permalink structure
   - Verify user permissions
   - Check error logs

3. **Frontend Not Loading**:
   - Verify build files exist
   - Check WordPress asset enqueuing
   - Verify shortcode placement

## Performance Considerations

### Frontend Optimization

- Use React.memo for expensive components
- Implement proper loading states
- Optimize bundle size with code splitting
- Use PrimeReact components efficiently

### Backend Optimization

- Use WordPress transients for caching
- Implement proper database indexing
- Optimize database queries
- Use WordPress object caching if available

### Production Deployment

1. **Environment Variables**:
   - Set proper MAIL_API_KEY
   - Configure database optimization
   - Enable WordPress caching

2. **Security**:
   - Use HTTPS in production
   - Regular plugin updates
   - Proper input validation
   - Rate limiting if needed

This development guide provides comprehensive information for contributing to the project. For additional help, create an issue in the GitHub repository with your specific question or problem.
