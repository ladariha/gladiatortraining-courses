# Gladiator Training Registrations

A comprehensive WordPress plugin for managing events and participant registrations with integrated payment tracking and email notifications.

## Overview

Gladiator Training Registrations is a full-featured event management system built as a WordPress plugin. It provides a modern React-based frontend with a robust PHP backend, designed to handle event creation, participant registration, payment tracking, and automated communications.

### Key Features

- 🎯 **Event Management**: Create, edit, and manage training events with detailed descriptions
- 👥 **Registration System**: Handle participant registrations with group support
- 💰 **Payment Tracking**: Monitor registration payments and generate bank transfer details
- 📧 **Email Integration**: Automated email notifications for registrations and updates
- 🔐 **Role-Based Access**: Different interfaces for administrators and visitors
- 📱 **Modern UI**: Responsive React frontend with PrimeReact components
- 🌍 **Internationalization**: Multi-language support ready
- 🔒 **GDPR Compliant**: Privacy controls and data protection features

## Quick Start

### Installation

1. Download the latest plugin ZIP file
2. Upload to your WordPress site via Plugins → Add New → Upload Plugin
3. Activate the plugin
4. Create a new page and add the shortcode: `[gladiatortraining_registrations_app]`

### Basic Configuration

After installation, administrators can:
- Access the event management interface through the frontend
- Create new events with details, pricing, and capacity limits
- Configure bank payment information
- Monitor registrations and payments

## Documentation

- **[Usage Guide](USAGE.md)** - Detailed instructions for administrators and end users
- **[Architecture Documentation](ARCHITECTURE.md)** - Technical overview for developers
- **[API Documentation](API.md)** - REST API reference
- **[Development Guide](DEVELOPMENT.md)** - Setup and contribution instructions

## Build & Deploy

```bash
$ MAIL_API_KEY='your_api_key' ./build.sh
```

This will:
- Increment version number
- Build the React frontend
- Package the plugin as a ZIP file
- Upload new plugin version

## System Requirements

- **WordPress**: 5.0+
- **PHP**: 7.4+
- **MySQL**: 5.6+
- **Node.js**: 16+ (for development)
- **Yarn**: Latest (for development)

## License

GPL-2.0+ - See [LICENSE.txt](LICENSE.txt) for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/ladariha/gladiatortraining-registrations/issues)
- **Author**: [Lada Riha](https://github.com/ladariha/)

## Disclaimer

This plugin was developed as a specialized solution for Gladiator Training events. While functional and feature-complete, the code style may not follow all WordPress coding standards.
