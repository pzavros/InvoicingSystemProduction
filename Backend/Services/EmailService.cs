using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Azure.Identity;
using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
// alias YOUR EmailSettings model to avoid clash with Microsoft.Graph.Models.EmailSettings
using AppEmailSettings = InvoicingBackend.Models.EmailSettings;

using Microsoft.Extensions.Options;
using Microsoft.Graph;                     // GraphServiceClient
using GraphModels = Microsoft.Graph.Models; // Message, Recipient, etc.
using Microsoft.Extensions.Logging;
using Microsoft.Kiota.Abstractions;

namespace InvoicingBackend.Services
{
    public class EmailService : IEmailService
    {
        private readonly AppEmailSettings _emailSettings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<AppEmailSettings> emailSettings, ILogger<EmailService> logger)
        {
            _emailSettings = emailSettings.Value;
            _logger = logger;
        }

        public async Task<EmailResponseDto> SendEmailAsync(string to, string subject, string body, bool isHtml = true)
        {
            var dto = new EmailDto { To = to, Subject = subject, Body = body, IsHtml = isHtml };
            return await SendEmailAsync(dto);
        }

        public async Task<EmailResponseDto> SendEmailAsync(EmailDto emailDto)
{
    try
    {
        var client = CreateGraphClient();
        var message = BuildGraphMessage(emailDto);
        var sendBody = new Microsoft.Graph.Users.Item.SendMail.SendMailPostRequestBody
        {
            Message = message,
            SaveToSentItems = true
        };

        await client.Users[_emailSettings.FromAddress].SendMail.PostAsync(sendBody);
        return new EmailResponseDto { Success = true, Message = "Email sent via Microsoft Graph" };
    }
    catch (Azure.Identity.AuthenticationFailedException authEx)
{
    _logger.LogError(authEx, "Graph auth failed. Check TenantId/ClientId/ClientSecret and admin consent.");
    return new EmailResponseDto { Success = false, Message = $"Graph auth failed: {authEx.Message}" };
}
catch (ApiException apiEx) // <- Graph v5
{
    // apiEx.ResponseStatusCode has the HTTP status; apiEx.Message contains Graph error summary
    _logger.LogError(apiEx, "Graph rejected the request. Status: {Status}", apiEx.ResponseStatusCode);
    return new EmailResponseDto
    {
        Success = false,
        Message = $"Graph error {(int?)apiEx.ResponseStatusCode}: {apiEx.Message}"
    };
}
catch (Exception ex)
{
    _logger.LogError(ex, "Graph send failed.");
    return new EmailResponseDto { Success = false, Message = $"Graph send failed: {ex.Message}" };
}

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
    <p>Best regards,<br>{_emailSettings.FromName}</p>
  </body>
</html>";

            var dto = new EmailDto
            {
                To = to, Subject = subject, Body = body, IsHtml = true,
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
            return await SendEmailAsync(dto);
        }

        public Task<EmailResponseDto> SendWelcomeEmailAsync(string to, string userName)
            => SendEmailAsync(to, "Welcome to Our Invoicing System",
$@"<html><body>
<h2>Welcome {userName}!</h2>
<p>Thank you for registering with our invoicing system.</p>
<p>You can now start creating and managing your invoices.</p>
<p>If you have any questions, please don't hesitate to contact us.</p>
<br><p>Best regards,<br>{_emailSettings.FromName}</p>
</body></html>", true);

        public Task<EmailResponseDto> SendPasswordResetEmailAsync(string to, string resetToken)
            => SendEmailAsync(to, "Password Reset Request",
$@"<html><body>
<h2>Password Reset Request</h2>
<p>You have requested to reset your password.</p>
<p>Your password reset token is: <strong>{resetToken}</strong></p>
<p>This token will expire in 24 hours.</p>
<p>If you did not request this password reset, please ignore this email.</p>
<br><p>Best regards,<br>{_emailSettings.FromName}</p>
</body></html>", true);

        public Task<EmailResponseDto> SendPasswordChangeOtpEmailAsync(string to, string userName, string otp)
            => SendEmailAsync(to, "Password Change Verification Code",
$@"<html><body style='font-family: Arial, sans-serif;'>
<h2>Password Change Verification</h2>
<p>Hello {userName},</p>
<p>Please use the following verification code:</p>
<div style='background-color:#f5f5f5;padding:20px;text-align:center;margin:20px 0;'>
  <h1 style='color:#333;font-size:32px;letter-spacing:5px;margin:0;'>{otp}</h1>
</div>
<p>This code will expire in 5 minutes.</p>
<br><p>Best regards,<br>The E-nvoicing Team</p>
</body></html>", true);

        // ----------------- Helpers -----------------

        private GraphServiceClient CreateGraphClient()
        {
            var credential = new ClientSecretCredential(
                _emailSettings.TenantId,
                _emailSettings.ClientId,
                _emailSettings.ClientSecret);

            return new GraphServiceClient(credential, new[] { "https://graph.microsoft.com/.default" });
        }

        private GraphModels.Message BuildGraphMessage(EmailDto dto)
        {
            var msg = new GraphModels.Message
            {
                Subject = dto.Subject,
                Body = new GraphModels.ItemBody
                {
                    ContentType = dto.IsHtml ? GraphModels.BodyType.Html : GraphModels.BodyType.Text,
                    Content = dto.Body ?? string.Empty
                },
                ToRecipients = new List<GraphModels.Recipient>
                {
                    new GraphModels.Recipient { EmailAddress = new GraphModels.EmailAddress { Address = dto.To } }
                },
                From = new GraphModels.Recipient
                {
                    EmailAddress = new GraphModels.EmailAddress
                    {
                        Address = _emailSettings.FromAddress,
                        Name = _emailSettings.FromName
                    }
                }
            };

            if (dto.Cc is not null)
            {
                msg.CcRecipients = new List<GraphModels.Recipient>();
                foreach (var cc in dto.Cc)
                    msg.CcRecipients.Add(new GraphModels.Recipient { EmailAddress = new GraphModels.EmailAddress { Address = cc } });
            }

            if (dto.Bcc is not null)
            {
                msg.BccRecipients = new List<GraphModels.Recipient>();
                foreach (var bcc in dto.Bcc)
                    msg.BccRecipients.Add(new GraphModels.Recipient { EmailAddress = new GraphModels.EmailAddress { Address = bcc } });
            }

            if (dto.Attachments is not null)
            {
                msg.Attachments = new List<GraphModels.Attachment>();
                foreach (var a in dto.Attachments)
                {
                    msg.Attachments.Add(new GraphModels.FileAttachment
                    {
                        OdataType = "#microsoft.graph.fileAttachment",
                        Name = a.FileName,
                        ContentType = a.ContentType,
                        ContentBytes = a.Content
                    });
                }
            }

            return msg;
        }
    }
}
