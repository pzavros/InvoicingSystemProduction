# Email Service Implementation

This implementation provides a clean and simple email sending functionality using SMTP with Office 365/Outlook.

## Configuration

### Environment Files

The email configuration is managed through environment files located in the root directory:

- `.env.development` - For development environment
- `.env.production` - For production environment

### Required Environment Variables

```env
EMAIL_SMTP_HOST=smtp.office365.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USERNAME=your-email@yourdomain.com
EMAIL_SMTP_PASSWORD=your-app-password
EMAIL_FROM_NAME=Your Company Name
EMAIL_FROM_ADDRESS=your-email@yourdomain.com
EMAIL_USE_SSL=true
EMAIL_ENABLE_SSL=true
```

### Setting up Office 365 App Password

1. Go to your Microsoft Account Security settings
2. Enable two-factor authentication (required for app passwords)
3. Go to "App passwords" section
4. Generate a new app password for your application
5. Use this app password in the `EMAIL_SMTP_PASSWORD` field

## Usage

### API Endpoints

#### 1. Send Simple Email
```
POST /api/email/send-simple
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Test Subject",
  "body": "<h1>Hello World</h1>",
  "isHtml": true
}
```

#### 2. Send Advanced Email with Attachments
```
POST /api/email/send
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Invoice #12345",
  "body": "<h1>Your Invoice</h1><p>Please find attached your invoice.</p>",
  "isHtml": true,
  "cc": ["manager@company.com"],
  "bcc": ["archive@company.com"],
  "attachments": [
    {
      "fileName": "invoice.pdf",
      "content": "base64-encoded-pdf-content",
      "contentType": "application/pdf"
    }
  ]
}
```

#### 3. Test Email Configuration
```
POST /api/email/test-connection
```

### Service Methods

The `IEmailService` provides several convenient methods:

```csharp
// Simple email
await emailService.SendEmailAsync("to@example.com", "Subject", "Body", isHtml: true);

// Advanced email with DTO
var emailDto = new EmailDto { /* ... */ };
await emailService.SendEmailAsync(emailDto);

// Pre-configured templates
await emailService.SendWelcomeEmailAsync("user@example.com", "John Doe");
await emailService.SendPasswordResetEmailAsync("user@example.com", "reset-token");
await emailService.SendInvoiceEmailAsync("client@example.com", "INV-001", pdfBytes);
```

## Security

- All email endpoints require authentication (JWT token)
- Environment variables should never be committed to version control
- Use app passwords instead of regular passwords for Office 365
- Consider using Azure Key Vault or similar services for production secrets

## Testing

Use the test endpoint to verify your email configuration:

```bash
curl -X POST "https://your-api-url/api/email/test-connection" \
  -H "Authorization: Bearer your-jwt-token"
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Ensure you're using an app password, not your regular password
2. **SMTP Connection Failed**: Verify the SMTP host and port settings
3. **TLS/SSL Issues**: Ensure `EMAIL_ENABLE_SSL=true` for Office 365

### Logging

The service logs all email operations. Check the application logs for detailed error messages.

## Integration Examples

### Sending Invoice Email from InvoiceController

```csharp
[HttpPost("{id}/send-email")]
public async Task<IActionResult> SendInvoiceEmail(int id, [FromBody] EmailRecipientDto recipient)
{
    var invoice = await _invoiceService.GetInvoiceByIdAsync(id);
    if (invoice == null) return NotFound();

    var pdfBytes = await _invoiceService.GenerateInvoicePdfAsync(id);
    var result = await _emailService.SendInvoiceEmailAsync(
        recipient.Email, 
        invoice.InvoiceNumber, 
        pdfBytes
    );

    return result.Success ? Ok(result) : BadRequest(result);
}
```

### Sending Welcome Email After Registration

```csharp
[HttpPost("register")]
public async Task<IActionResult> Register([FromBody] RegisterDto model)
{
    var user = await _userService.CreateUserAsync(model);
    
    // Send welcome email
    await _emailService.SendWelcomeEmailAsync(user.Email, user.Name);
    
    return Ok(new { message = "User registered successfully" });
}
```
