using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using InvoicingBackend.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace InvoicingBackend.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> emailSettings, ILogger<EmailService> logger)
        {
            _emailSettings = emailSettings.Value;
            _logger = logger;
        }

        public async Task<EmailResponseDto> SendEmailAsync(EmailDto emailDto)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_emailSettings.FromName, _emailSettings.FromAddress));
                message.To.Add(MailboxAddress.Parse(emailDto.To));
                message.Subject = emailDto.Subject;

                // Add CC recipients if provided
                if (emailDto.Cc != null && emailDto.Cc.Any())
                {
                    foreach (var cc in emailDto.Cc)
                    {
                        message.Cc.Add(MailboxAddress.Parse(cc));
                    }
                }

                // Add BCC recipients if provided
                if (emailDto.Bcc != null && emailDto.Bcc.Any())
                {
                    foreach (var bcc in emailDto.Bcc)
                    {
                        message.Bcc.Add(MailboxAddress.Parse(bcc));
                    }
                }

                var builder = new BodyBuilder();

                if (emailDto.IsHtml)
                {
                    builder.HtmlBody = emailDto.Body;
                }
                else
                {
                    builder.TextBody = emailDto.Body;
                }

                // Add attachments if provided
                if (emailDto.Attachments != null && emailDto.Attachments.Any())
                {
                    foreach (var attachment in emailDto.Attachments)
                    {
                        builder.Attachments.Add(attachment.FileName, attachment.Content, ContentType.Parse(attachment.ContentType));
                    }
                }

                message.Body = builder.ToMessageBody();

                using var client = new SmtpClient();
                
                // Connect to the SMTP server
                await client.ConnectAsync(_emailSettings.SmtpHost, _emailSettings.SmtpPort, 
                    _emailSettings.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None);

                // Authenticate if credentials are provided
                if (!string.IsNullOrEmpty(_emailSettings.Username) && !string.IsNullOrEmpty(_emailSettings.Password))
                {
                    await client.AuthenticateAsync(_emailSettings.Username, _emailSettings.Password);
                }

                // Send the email
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email sent successfully to {To}", emailDto.To);

                return new EmailResponseDto
                {
                    Success = true,
                    Message = "Email sent successfully"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {To}", emailDto.To);

                return new EmailResponseDto
                {
                    Success = false,
                    Message = $"Failed to send email: {ex.Message}"
                };
            }
        }

        public async Task<EmailResponseDto> SendEmailAsync(string to, string subject, string body, bool isHtml = true)
        {
            var emailDto = new EmailDto
            {
                To = to,
                Subject = subject,
                Body = body,
                IsHtml = isHtml
            };

            return await SendEmailAsync(emailDto);
        }

        public async Task<EmailResponseDto> SendInvoiceEmailAsync(string to, string invoiceNumber, byte[] pdfContent)
        {
            var subject = $"Invoice {invoiceNumber}";
            var body = $@"
                <html>
                <body>
                    <h2>Invoice {invoiceNumber}</h2>
                    <p>Dear Customer,</p>
                    <p>Please find attached your invoice #{invoiceNumber}.</p>
                    <p>Thank you for your business!</p>
                    <br>
                    <p>Best regards,<br>
                    {_emailSettings.FromName}</p>
                </body>
                </html>";

            var emailDto = new EmailDto
            {
                To = to,
                Subject = subject,
                Body = body,
                IsHtml = true,
                Attachments = new List<EmailAttachmentDto>
                {
                    new EmailAttachmentDto
                    {
                        FileName = $"Invoice_{invoiceNumber}.pdf",
                        Content = pdfContent,
                        ContentType = "application/pdf"
                    }
                }
            };

            return await SendEmailAsync(emailDto);
        }

        public async Task<EmailResponseDto> SendWelcomeEmailAsync(string to, string userName)
        {
            var subject = "Welcome to Our Invoicing System";
            var body = $@"
                <html>
                <body>
                    <h2>Welcome {userName}!</h2>
                    <p>Thank you for registering with our invoicing system.</p>
                    <p>You can now start creating and managing your invoices.</p>
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                    <br>
                    <p>Best regards,<br>
                    {_emailSettings.FromName}</p>
                </body>
                </html>";

            return await SendEmailAsync(to, subject, body);
        }

        public async Task<EmailResponseDto> SendPasswordResetEmailAsync(string to, string resetToken)
        {
            var subject = "Password Reset Request";
            var body = $@"
                <html>
                <body>
                    <h2>Password Reset Request</h2>
                    <p>You have requested to reset your password.</p>
                    <p>Your password reset token is: <strong>{resetToken}</strong></p>
                    <p>Please use this token to reset your password. This token will expire in 24 hours.</p>
                    <p>If you did not request this password reset, please ignore this email.</p>
                    <br>
                    <p>Best regards,<br>
                    {_emailSettings.FromName}</p>
                </body>
                </html>";

            return await SendEmailAsync(to, subject, body);
        }
    }
}
