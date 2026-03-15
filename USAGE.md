# Usage Guide

This guide covers how to use the Gladiator Training Registrations plugin for both administrators and end users.

## Table of Contents

- [Administrator Guide](#administrator-guide)
- [End User Guide](#end-user-guide)
- [Common Workflows](#common-workflows)
- [Troubleshooting](#troubleshooting)

## Administrator Guide

### Initial Setup

1. **Plugin Installation**
   - Upload and activate the plugin in WordPress admin
   - Create a new page for the registration system
   - Add the shortcode `[gladiatortraining_registrations_app]` to the page
   - Publish the page

2. **First Login**
   - Navigate to the page with the shortcode
   - As an administrator (WordPress user with `manage_options` capability), you'll see the admin interface

### Event Management

#### Creating a New Event

1. Click "New Event" in the admin interface
2. Fill out the event details:
   - **Name**: Event title
   - **Short Description**: Brief summary for listings
   - **Description**: Full event details (supports rich text editing)
   - **Date & Time**: When the event takes place
   - **Maximum Participants**: Capacity limit
   - **Registration Deadline**: Last date for registrations
   - **Price**: Cost per participant
   - **Image**: Event photo or logo

3. **Payment Information** (Bank Details):
   - **Bank Code**: Your bank's code
   - **Account Number**: Your account number
   - **IBAN**: International Bank Account Number
   - **SWIFT**: Bank identifier code
   - **Prefix**: Account prefix if applicable

4. Click "Save" to create the event

#### Managing Existing Events

- **View Events**: See all events in the events list
- **Edit Event**: Click on an event to modify its details
- **Event Visibility**: Toggle whether an event is visible to the public
- **Registration Status**: Monitor current registrations vs. capacity

#### Registration Management

1. **View Registrations**
   - Click on an event to see all registrations
   - View participant details, payment status, and group information

2. **Payment Tracking**
   - Mark registrations as paid when payment is received
   - Export registration data for record-keeping
   - Generate payment instructions for participants

3. **Communication**
   - Send automated emails to registered participants
   - Access participant contact information for manual communication

### User Management

- **Admin Access**: WordPress users with `manage_options` capability can create and manage events
- **Visitor Access**: Regular users can view and register for public events
- **Registration Groups**: Handle group registrations with designated group leaders

## End User Guide

### Viewing Events

1. Navigate to the registration page
2. Browse available upcoming events
3. Click on any event to view detailed information

### Registering for Events

1. **Individual Registration**:
   - Click "Register" on the desired event
   - Fill out personal information:
     - Full name
     - Email address
     - Date of birth
     - Gender
     - Address
     - Club/organization (if applicable)
   - Review pricing information
   - Accept GDPR terms
   - Submit registration

2. **Group Registration**:
   - One person registers as the group leader
   - Provide information for all group members
   - Group leader receives all communications
   - Payment responsibility typically lies with the group leader

### After Registration

1. **Confirmation Email**: You'll receive an email confirmation with event details
2. **Payment Instructions**: Bank transfer details will be provided
3. **Event Updates**: You'll be notified of any changes to the event

## Common Workflows

### Setting Up a Training Series

1. Create multiple events for different dates
2. Use consistent naming (e.g., "Basic Training - Session 1", "Basic Training - Session 2")
3. Set appropriate capacity limits for your venue
4. Configure early registration deadlines to ensure planning time

### Managing Payments

1. **Bank Transfer Process**:
   - Participants receive bank details after registration
   - Monitor your bank account for incoming payments
   - Match payments to registrations using participant names or reference numbers
   - Mark registrations as "paid" in the admin interface

2. **Payment Tracking**:
   - Use the admin interface to see payment status at a glance
   - Generate reports of paid vs. unpaid registrations
   - Send reminders for outstanding payments

### Event Communication

1. **Pre-Event**:
   - Send location details and preparation instructions
   - Confirm final attendance numbers
   - Share any last-minute updates

2. **Post-Event**:
   - Follow up with participants for feedback
   - Share photos or additional resources
   - Promote future events

## Advanced Features

### Rich Text Event Descriptions

The event description field supports rich text editing with:
- Headers and text formatting
- Bullet points and numbered lists
- Embedded links and images
- Quote blocks
- Tables for schedules or information

### GDPR Compliance

- Participant consent is collected during registration
- Data retention policies can be implemented
- Export and deletion of user data is supported
- Privacy controls are built into the system

### Multi-Language Support

The plugin is prepared for internationalization:
- Text strings are translatable
- Date and time formats respect WordPress locale settings
- Currency formatting can be localized

## Troubleshooting

### Common Issues

1. **Shortcode Not Working**
   - Ensure the plugin is activated
   - Check that the shortcode is exactly: `[gladiatortraining_registrations_app]`
   - Verify the page is published and accessible

2. **Admin Interface Not Showing**
   - Confirm your WordPress user has `manage_options` capability
   - Check browser console for JavaScript errors
   - Ensure the frontend build is properly loaded

3. **Registration Issues**
   - Check event capacity limits
   - Verify registration deadline hasn't passed
   - Ensure required fields are completed

4. **Email Problems**
   - Verify the MAIL_API_KEY is configured in build.sh
   - Check WordPress email settings
   - Test with different email providers

### Performance Considerations

- **Large Events**: For events with 100+ participants, consider server resources
- **Image Sizes**: Optimize event images for web display
- **Database**: Regular backups recommended for registration data
- **Caching**: WordPress caching plugins may need configuration for dynamic content

### Getting Help

1. Check the [GitHub Issues](https://github.com/ladariha/gladiatortraining-registrations/issues) for similar problems
2. Create a new issue with detailed information about your problem
3. Include WordPress version, plugin version, and browser information
4. Provide steps to reproduce the issue