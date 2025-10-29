using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading.Tasks;
using Azure.Identity;
using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using InvoicingBackend.Models;
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
        private readonly EmailTemplateService _templateService;

        public EmailService(IOptions<AppEmailSettings> emailSettings, ILogger<EmailService> logger)
        {
            _emailSettings = emailSettings.Value;
            _logger = logger;
            _templateService = new EmailTemplateService();
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

        // ==================== INVOICE-RELATED EMAILS ====================

        public async Task<EmailResponseDto> SendInvoiceEmailAsync(Invoice invoice, byte[] pdfContent, string? ccEmail = null)
        {
            try
            {
                var documentType = invoice.DocumentType?.Name ?? "Invoice";
                var currencySymbol = invoice.Currency?.Symbol ?? "$";
                
                var paymentInfo = string.Empty;
                if (!string.IsNullOrEmpty(invoice.BankName) || !string.IsNullOrEmpty(invoice.AccountNo))
                {
                    paymentInfo = "<div class=\"info-box\"><p><strong>Payment Information:</strong></p>";
                    if (!string.IsNullOrEmpty(invoice.BankName))
                        paymentInfo += $"<p>Bank: {invoice.BankName}</p>";
                    if (!string.IsNullOrEmpty(invoice.AccountName))
                        paymentInfo += $"<p>Account Name: {invoice.AccountName}</p>";
                    if (!string.IsNullOrEmpty(invoice.AccountNo))
                        paymentInfo += $"<p>Account Number: {invoice.AccountNo}</p>";
                    if (!string.IsNullOrEmpty(invoice.Iban))
                        paymentInfo += $"<p>IBAN: {invoice.Iban}</p>";
                    if (!string.IsNullOrEmpty(invoice.Swift))
                        paymentInfo += $"<p>SWIFT: {invoice.Swift}</p>";
                    paymentInfo += "</div>";
                }

                var body = _templateService.RenderSendInvoiceEmail(
                    clientName: invoice.BillTo,
                    invoiceNumber: invoice.InvoiceNumber,
                    documentType: documentType,
                    issueDate: invoice.DateOfIssue.ToString("MMMM dd, yyyy"),
                    dueDate: invoice.DueDate.ToString("MMMM dd, yyyy"),
                    totalAmount: $"{currencySymbol}{invoice.Total:N2}",
                    senderName: invoice.BillFrom,
                    paymentInfo: paymentInfo,
                    companyName: invoice.CompanyName,
                    companyEmail: invoice.CompanyEmail,
                    companyWebsite: invoice.Website
                );

                var emailDto = new EmailDto
                {
                    To = invoice.BillToEmail,
                    Subject = $"{documentType} {invoice.InvoiceNumber}",
                    Body = body,
                    IsHtml = true,
                    Cc = !string.IsNullOrEmpty(ccEmail) ? new List<string> { ccEmail } : null,
                    Attachments = new List<EmailAttachmentDto>
                    {
                        new EmailAttachmentDto
                        {
                            FileName = $"{documentType}_{invoice.InvoiceNumber}.pdf",
                            Content = pdfContent,
                            ContentType = "application/pdf"
                        }
                    }
                };

                return await SendEmailAsync(emailDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send invoice email for {InvoiceNumber}", invoice.InvoiceNumber);
                return new EmailResponseDto { Success = false, Message = $"Failed to send email: {ex.Message}" };
            }
        }

        public async Task<EmailResponseDto> SendInvoicePaymentReminderAsync(Invoice invoice, string? ccEmail = null)
        {
            try
            {
                var currencySymbol = invoice.Currency?.Symbol ?? "$";
                var daysUntilDue = (invoice.DueDate - DateTime.Now).Days;
                var dueStatus = daysUntilDue switch
                {
                    < 0 => $" and is now {Math.Abs(daysUntilDue)} days overdue",
                    0 => " and is due today",
                    1 => " tomorrow",
                    _ => $" in {daysUntilDue} days"
                };

                var paymentInfo = string.Empty;
                if (!string.IsNullOrEmpty(invoice.BankName) || !string.IsNullOrEmpty(invoice.AccountNo))
                {
                    paymentInfo = "<div class=\"info-box\"><p><strong>Payment Information:</strong></p>";
                    if (!string.IsNullOrEmpty(invoice.BankName))
                        paymentInfo += $"<p>Bank: {invoice.BankName}</p>";
                    if (!string.IsNullOrEmpty(invoice.AccountName))
                        paymentInfo += $"<p>Account Name: {invoice.AccountName}</p>";
                    if (!string.IsNullOrEmpty(invoice.AccountNo))
                        paymentInfo += $"<p>Account Number: {invoice.AccountNo}</p>";
                    if (!string.IsNullOrEmpty(invoice.Iban))
                        paymentInfo += $"<p>IBAN: {invoice.Iban}</p>";
                    if (!string.IsNullOrEmpty(invoice.Swift))
                        paymentInfo += $"<p>SWIFT: {invoice.Swift}</p>";
                    paymentInfo += "</div>";
                }

                var body = _templateService.RenderInvoicePaymentReminderEmail(
                    clientName: invoice.BillTo,
                    invoiceNumber: invoice.InvoiceNumber,
                    issueDate: invoice.DateOfIssue.ToString("MMMM dd, yyyy"),
                    dueDate: invoice.DueDate.ToString("MMMM dd, yyyy"),
                    totalAmount: $"{currencySymbol}{invoice.Total:N2}",
                    senderName: invoice.BillFrom,
                    dueStatus: dueStatus,
                    paymentInfo: paymentInfo,
                    companyName: invoice.CompanyName,
                    companyEmail: invoice.CompanyEmail
                );

                var emailDto = new EmailDto
                {
                    To = invoice.BillToEmail,
                    Subject = $"Payment Reminder - Invoice {invoice.InvoiceNumber}",
                    Body = body,
                    IsHtml = true,
                    Cc = !string.IsNullOrEmpty(ccEmail) ? new List<string> { ccEmail } : null
                };

                return await SendEmailAsync(emailDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send payment reminder for {InvoiceNumber}", invoice.InvoiceNumber);
                return new EmailResponseDto { Success = false, Message = $"Failed to send email: {ex.Message}" };
            }
        }

        public async Task<EmailResponseDto> SendInvoicePaidConfirmationAsync(Invoice invoice, byte[] pdfContent, string? ccEmail = null)
        {
            try
            {
                var currencySymbol = invoice.Currency?.Symbol ?? "$";

                var body = _templateService.RenderInvoicePaidConfirmationEmail(
                    clientName: invoice.BillTo,
                    invoiceNumber: invoice.InvoiceNumber,
                    paymentDate: DateTime.Now.ToString("MMMM dd, yyyy"),
                    totalAmount: $"{currencySymbol}{invoice.Total:N2}",
                    senderName: invoice.BillFrom,
                    companyName: invoice.CompanyName,
                    companyEmail: invoice.CompanyEmail
                );

                var emailDto = new EmailDto
                {
                    To = invoice.BillToEmail,
                    Subject = $"Payment Confirmation - Invoice {invoice.InvoiceNumber}",
                    Body = body,
                    IsHtml = true,
                    Cc = !string.IsNullOrEmpty(ccEmail) ? new List<string> { ccEmail } : null,
                    Attachments = new List<EmailAttachmentDto>
                    {
                        new EmailAttachmentDto
                        {
                            FileName = $"Receipt_{invoice.InvoiceNumber}.pdf",
                            Content = pdfContent,
                            ContentType = "application/pdf"
                        }
                    }
                };

                return await SendEmailAsync(emailDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send payment confirmation for {InvoiceNumber}", invoice.InvoiceNumber);
                return new EmailResponseDto { Success = false, Message = $"Failed to send email: {ex.Message}" };
            }
        }

        // ==================== USER ACCOUNT EMAILS ====================

        public async Task<EmailResponseDto> SendWelcomeEmailAsync(string to, string userName, string loginUrl)
        {
            try
            {
                var body = _templateService.RenderWelcomeEmail(userName, loginUrl);
                return await SendEmailAsync(to, "Welcome to E-nvoicing!", body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send welcome email to {Email}", to);
                return new EmailResponseDto { Success = false, Message = $"Failed to send email: {ex.Message}" };
            }
        }

        public async Task<EmailResponseDto> SendPasswordResetEmailAsync(string to, string userName, string resetToken)
        {
            try
            {
                var body = _templateService.RenderPasswordResetEmail(userName, resetToken);
                return await SendEmailAsync(to, "Password Reset Request", body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password reset email to {Email}", to);
                return new EmailResponseDto { Success = false, Message = $"Failed to send email: {ex.Message}" };
            }
        }

        public async Task<EmailResponseDto> SendPasswordChangeOtpEmailAsync(string to, string userName, string otp)
        {
            try
            {
                var body = _templateService.RenderPasswordChangeOtpEmail(userName, otp);
                return await SendEmailAsync(to, "Password Change Verification Code", body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send OTP email to {Email}", to);
                return new EmailResponseDto { Success = false, Message = $"Failed to send email: {ex.Message}" };
            }
        }

        public async Task<EmailResponseDto> SendAccountVerificationEmailAsync(string to, string userName, string verificationCode, string verificationUrl)
        {
            try
            {
                var body = _templateService.RenderAccountVerificationEmail(userName, verificationCode, verificationUrl);
                return await SendEmailAsync(to, "Verify Your Email Address", body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send verification email to {Email}", to);
                return new EmailResponseDto { Success = false, Message = $"Failed to send email: {ex.Message}" };
            }
        }

        // ==================== CONTACT/SUPPORT EMAILS ====================

        public async Task<EmailResponseDto> SendContactFormSubmissionAsync(string to, string userName, string message, string referenceId, string? ccEmail = null)
        {
            try
            {
                var body = _templateService.RenderContactFormSubmissionEmail(
                    userName, 
                    to, 
                    message, 
                    referenceId, 
                    DateTime.Now.ToString("MMMM dd, yyyy HH:mm")
                );
                
                var emailDto = new EmailDto
                {
                    To = to,
                    Subject = "We Received Your Message",
                    Body = body,
                    IsHtml = true,
                    Cc = !string.IsNullOrEmpty(ccEmail) ? new List<string> { ccEmail } : null
                };
                
                return await SendEmailAsync(emailDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send contact form submission email to {Email}", to);
                return new EmailResponseDto { Success = false, Message = $"Failed to send email: {ex.Message}" };
            }
        }

        public async Task<EmailResponseDto> SendAdminContactNotificationAsync(
            string adminEmail, 
            string userName, 
            string userEmail, 
            string subject, 
            string message, 
            string referenceId, 
            string? userInfo = null,
            string? ccEmail = null)
        {
            try
            {
                var body = _templateService.RenderAdminContactNotificationEmail(
                    userName,
                    userEmail,
                    subject,
                    message,
                    referenceId,
                    DateTime.Now.ToString("MMMM dd, yyyy HH:mm"),
                    userInfo
                );
                
                var emailDto = new EmailDto
                {
                    To = adminEmail,
                    Subject = $"New Contact: {subject}",
                    Body = body,
                    IsHtml = true,
                    Cc = !string.IsNullOrEmpty(ccEmail) ? new List<string> { ccEmail } : null
                };
                
                return await SendEmailAsync(emailDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send admin notification email to {Email}", adminEmail);
                return new EmailResponseDto { Success = false, Message = $"Failed to send email: {ex.Message}" };
            }
        }

        // ==================== SUBSCRIPTION EMAILS ====================

        public async Task<EmailResponseDto> SendTrialStartedEmailAsync(
            string to, 
            string userName, 
            DateTime trialStartDate, 
            DateTime trialEndDate, 
            string dashboardUrl)
        {
            try
            {
                var duration = (trialEndDate - trialStartDate).Days;
                var body = _templateService.RenderTrialStartedEmail(
                    userName,
                    trialStartDate.ToString("MMMM dd, yyyy"),
                    trialEndDate.ToString("MMMM dd, yyyy"),
                    $"{duration} days",
                    dashboardUrl
                );
                return await SendEmailAsync(to, "Your Free Trial Has Started!", body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send trial started email to {Email}", to);
                return new EmailResponseDto { Success = false, Message = $"Failed to send email: {ex.Message}" };
            }
        }

        public async Task<EmailResponseDto> SendSubscriptionCancelledEmailAsync(
            string to, 
            string userName, 
            DateTime cancellationDate, 
            DateTime accessEndDate, 
            string planName, 
            string feedbackUrl)
        {
            try
            {
                var body = _templateService.RenderSubscriptionCancelledEmail(
                    userName,
                    cancellationDate.ToString("MMMM dd, yyyy"),
                    accessEndDate.ToString("MMMM dd, yyyy"),
                    planName,
                    "10", // Free invoice limit - could be configurable
                    feedbackUrl
                );
                return await SendEmailAsync(to, "Subscription Cancelled", body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send subscription cancelled email to {Email}", to);
                return new EmailResponseDto { Success = false, Message = $"Failed to send email: {ex.Message}" };
            }
        }

        public async Task<EmailResponseDto> SendPremiumUpgradeEmailAsync(
            string to,
            string userName,
            DateTime startDate,
            DateTime nextBillingDate,
            decimal monthlyPrice,
            string dashboardUrl)
        {
            try
            {
                var body = _templateService.RenderPremiumUpgradeEmail(
                    userName,
                    startDate.ToString("MMMM dd, yyyy"),
                    nextBillingDate.ToString("MMMM dd, yyyy"),
                    monthlyPrice.ToString("0.00"),
                    dashboardUrl
                );
                return await SendEmailAsync(to, "Welcome to E-nvoicing Premium! 🌟", body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send premium upgrade email to {Email}", to);
                return new EmailResponseDto { Success = false, Message = $"Failed to send email: {ex.Message}" };
            }
        }

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
