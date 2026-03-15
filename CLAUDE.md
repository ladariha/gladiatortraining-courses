# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WordPress plugin called "gladiatortraining-courses" for displaying timetable of workout events. The project combines PHP backend (WordPress plugin architecture) with a vanilla HTML frontend.

## Build and Development Commands

### Building the Plugin
```bash
./build.sh
```

- Increments version number automatically
- Creates distributable ZIP file


## Architecture

### WordPress Plugin Structure
- **Main file**: `gladiatortraining-courses.php` - Plugin bootstrap and registration
- **includes/**: Core plugin classes and REST API routes
- **admin/**: WordPress admin interface components
- **public/**: Public-facing WordPress functionality
- **languages/**: Translation files


### Frontend Architecture (frontend/)
- plain HTML and JS

### Key Files
- `Persistance.php`: Database operations and data persistence
- `Utils.php`: General utility functions

## Installation
1. Upload plugin ZIP to WordPress
2. Create WordPress page with shortcode: `[gladiatortraining_courses_app]`

## Version Management
- Version numbers are automatically managed by `build.sh`
- Current version stored in main PHP file
- Build script updates version in multiple locations
