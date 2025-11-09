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

        public async Task<EmailResponseDto> SendSupportTicketConfirmationAsync(
            string to, 
            string userName, 
            string referenceNumber, 
            string subject, 
            string ticketType)
        {
            try
            {
                var body = _templateService.RenderSupportTicketCreatedEmail(
                    userName,
                    referenceNumber,
                    "Medium",
                    DateTime.Now.ToString("MMMM dd, yyyy HH:mm"),
                    $"Type: {ticketType}\nSubject: {subject}"
                );
                
                var emailDto = new EmailDto
                {
                    To = to,
                    Subject = $"Support Ticket Created: {referenceNumber}",
                    Body = body,
                    IsHtml = true
                };
                
                return await SendEmailAsync(emailDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send support ticket confirmation email to {Email}", to);
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
                    "3", // Free invoice limit
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

        public async Task<EmailResponseDto> SendPaymentSuccessEmailAsync(
            string to,
            string userName,
            decimal amount,
            string currency,
            DateTime paymentDate,
            DateTime nextBillingDate,
            string invoiceUrl)
        {
            try
            {
                var subject = $"Payment Received - €{amount:F2} - E-nvoicing Premium";
                var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .success-badge {{ background: #10b981; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 20px 0; }}
        .details {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }}
        .detail-row {{ display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }}
        .detail-label {{ font-weight: bold; color: #666; }}
        .detail-value {{ color: #333; }}
        .button {{ background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }}
        .button:hover {{ background: #5568d3; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>✅ Payment Successful!</h1>
        </div>
        <div class='content'>
            <p>Hi {userName},</p>
            
            <div class='success-badge'>
                💳 Payment Processed Successfully
            </div>
            
            <p>Thank you for your payment! Your E-nvoicing Premium subscription has been renewed.</p>
            
            <div class='details'>
                <h3>Payment Details</h3>
                <div class='detail-row'>
                    <span class='detail-label'>Amount Paid:</span>
                    <span class='detail-value'><strong>€{amount:F2} {currency.ToUpper()}</strong></span>
                </div>
                <div class='detail-row'>
                    <span class='detail-label'>Payment Date:</span>
                    <span class='detail-value'>{paymentDate:MMMM dd, yyyy}</span>
                </div>
                <div class='detail-row'>
                    <span class='detail-label'>Next Billing Date:</span>
                    <span class='detail-value'>{nextBillingDate:MMMM dd, yyyy}</span>
                </div>
                <div class='detail-row'>
                    <span class='detail-label'>Status:</span>
                    <span class='detail-value' style='color: #10b981;'><strong>✓ Active</strong></span>
                </div>
            </div>
            
            <p><strong>What's Next?</strong></p>
            <ul>
                <li>Your premium features remain active</li>
                <li>You'll be charged automatically on {nextBillingDate:MMMM dd, yyyy}</li>
                <li>You can cancel anytime from your dashboard</li>
            </ul>
            
            <center>
                <a href='{invoiceUrl}' class='button'>View Invoice</a>
            </center>
            
            <p style='margin-top: 30px; color: #666; font-size: 14px;'>
                If you have any questions about your payment or subscription, please don't hesitate to contact us at <a href='mailto:support@e-nvoicing.com'>support@e-nvoicing.com</a>
            </p>
        </div>
        <div class='footer'>
            <p>&copy; 2025 E-nvoicing. All rights reserved.</p>
            <p>This is an automated payment confirmation email.</p>
        </div>
    </div>
</body>
</html>";

                return await SendEmailAsync(to, subject, body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send payment success email to {Email}", to);
                return new EmailResponseDto { Success = false, Message = $"Failed to send email: {ex.Message}" };
            }
        }

        public async Task<EmailResponseDto> SendPaymentFailedEmailAsync(
            string to,
            string userName,
            decimal amount,
            string currency,
            string failureReason,
            string updatePaymentUrl)
        {
            try
            {
                var subject = "⚠️ Payment Failed - Action Required - E-nvoicing";
                var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .warning-badge {{ background: #f59e0b; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 20px 0; }}
        .alert-box {{ background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 8px; }}
        .details {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        .button {{ background: #ef4444; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }}
        .button:hover {{ background: #dc2626; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>⚠️ Payment Failed</h1>
        </div>
        <div class='content'>
            <p>Hi {userName},</p>
            
            <div class='warning-badge'>
                Action Required Within 7 Days
            </div>
            
            <div class='alert-box'>
                <h3 style='margin-top: 0; color: #dc2626;'>⚠️ We couldn't process your payment</h3>
                <p><strong>Amount:</strong> €{amount:F2} {currency.ToUpper()}</p>
                <p><strong>Reason:</strong> {failureReason}</p>
            </div>
            
            <p><strong>What happens now?</strong></p>
            <ul>
                <li>We'll automatically retry your payment over the next 3 weeks</li>
                <li>Your premium access remains active during this period</li>
                <li>If all retries fail, your subscription will be cancelled</li>
            </ul>
            
            <p><strong>How to fix this:</strong></p>
            <ol>
                <li>Update your payment method using the button below</li>
                <li>Ensure your card has sufficient funds</li>
                <li>Check that your card details are up to date</li>
            </ol>
            
            <center>
                <a href='{updatePaymentUrl}' class='button'>Update Payment Method</a>
            </center>
            
            <div class='details'>
                <p><strong>Common reasons for payment failures:</strong></p>
                <ul style='color: #666;'>
                    <li>Insufficient funds in your account</li>
                    <li>Expired credit card</li>
                    <li>Card issuer declined the transaction</li>
                    <li>Incorrect card details</li>
                </ul>
            </div>
            
            <p style='margin-top: 30px; color: #666; font-size: 14px;'>
                Need help? Contact us at <a href='mailto:support@e-nvoicing.com'>support@e-nvoicing.com</a> and we'll assist you right away.
            </p>
        </div>
        <div class='footer'>
            <p>&copy; 2025 E-nvoicing. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

                return await SendEmailAsync(to, subject, body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send payment failed email to {Email}", to);
                return new EmailResponseDto { Success = false, Message = $"Failed to send email: {ex.Message}" };
            }
        }

        public async Task<EmailResponseDto> SendTrialEndingReminderEmailAsync(
            string to,
            string userName,
            DateTime trialEndDate,
            decimal monthlyPrice,
            string updatePaymentUrl)
        {
            try
            {
                var daysLeft = (trialEndDate - DateTime.UtcNow).Days;
                var subject = $"⏰ Your Free Trial Ends in {daysLeft} Days - E-nvoicing";
                var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .countdown {{ background: white; padding: 30px; text-align: center; border-radius: 10px; margin: 20px 0; border: 3px solid #f59e0b; }}
        .days {{ font-size: 48px; font-weight: bold; color: #f59e0b; }}
        .features {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        .feature-item {{ padding: 10px 0; border-bottom: 1px solid #eee; }}
        .feature-item:last-child {{ border-bottom: none; }}
        .checkmark {{ color: #10b981; font-weight: bold; }}
        .button {{ background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }}
        .button:hover {{ background: #5568d3; }}
        .price {{ font-size: 32px; font-weight: bold; color: #667eea; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>⏰ Trial Ending Soon!</h1>
        </div>
        <div class='content'>
            <p>Hi {userName},</p>
            
            <p>Just a friendly reminder that your <strong>7-day free trial</strong> of E-nvoicing Premium is coming to an end.</p>
            
            <div class='countdown'>
                <div class='days'>{daysLeft}</div>
                <div style='font-size: 20px; color: #666;'>Days Remaining</div>
                <p style='margin-top: 15px; color: #666;'>Trial ends on <strong>{trialEndDate:MMMM dd, yyyy}</strong></p>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <p>On {trialEndDate:MMMM dd, yyyy}, we'll automatically charge your payment method:</p>
            
            <div style='text-align: center; margin: 30px 0;'>
                <span class='price'>€{monthlyPrice:F2}</span>
                <span style='color: #666; font-size: 18px;'>/month</span>
            </div>
            
            <div class='features'>
                <h3 style='margin-top: 0;'>Continue enjoying Premium features:</h3>
                <div class='feature-item'>
                    <span class='checkmark'>✓</span> Unlimited invoices
                </div>
                <div class='feature-item'>
                    <span class='checkmark'>✓</span> Unlimited clients
                </div>
                <div class='feature-item'>
                    <span class='checkmark'>✓</span> Advanced reporting
                </div>
                <div class='feature-item'>
                    <span class='checkmark'>✓</span> Custom templates
                </div>
                <div class='feature-item'>
                    <span class='checkmark'>✓</span> Priority support
                </div>
            </div>
            
            <p><strong>Want to continue?</strong></p>
            <p>Make sure your payment method is up to date. If you need to update it, click below:</p>
            
            <center>
                <a href='{updatePaymentUrl}' class='button'>Update Payment Method</a>
            </center>
            
            <p><strong>Want to cancel?</strong></p>
            <p>No problem! You can cancel anytime from your dashboard before {trialEndDate:MMMM dd, yyyy} to avoid being charged. You'll still have access until your trial ends.</p>
            
            <p style='margin-top: 30px; color: #666; font-size: 14px;'>
                Questions? We're here to help at <a href='mailto:support@e-nvoicing.com'>support@e-nvoicing.com</a>
            </p>
        </div>
        <div class='footer'>
            <p>&copy; 2025 E-nvoicing. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

                return await SendEmailAsync(to, subject, body, true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send trial ending reminder email to {Email}", to);
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
