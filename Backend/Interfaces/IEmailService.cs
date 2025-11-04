using InvoicingBackend.DTOs;
using InvoicingBackend.Models;

namespace InvoicingBackend.Interfaces
{
    public interface IEmailService
    {
        Task<EmailResponseDto> SendEmailAsync(EmailDto emailDto);
        Task<EmailResponseDto> SendEmailAsync(string to, string subject, string body, bool isHtml = true);
        
        // Invoice-related emails
        Task<EmailResponseDto> SendInvoiceEmailAsync(Invoice invoice, byte[] pdfContent, string? ccEmail = null);
        Task<EmailResponseDto> SendInvoicePaymentReminderAsync(Invoice invoice, string? ccEmail = null);
        Task<EmailResponseDto> SendInvoicePaidConfirmationAsync(Invoice invoice, byte[] pdfContent, string? ccEmail = null);
        
        // User account emails
        Task<EmailResponseDto> SendWelcomeEmailAsync(string to, string userName, string loginUrl);
        Task<EmailResponseDto> SendPasswordResetEmailAsync(string to, string userName, string resetToken);
        Task<EmailResponseDto> SendPasswordChangeOtpEmailAsync(string to, string userName, string otp);
        Task<EmailResponseDto> SendAccountVerificationEmailAsync(string to, string userName, string verificationCode, string verificationUrl);
        
        // Contact/Support emails
        Task<EmailResponseDto> SendContactFormSubmissionAsync(string to, string userName, string message, string referenceId, string? ccEmail = null);
        Task<EmailResponseDto> SendAdminContactNotificationAsync(string adminEmail, string userName, string userEmail, string subject, string message, string referenceId, string? userInfo = null, string? ccEmail = null);
        
        // Subscription emails
        Task<EmailResponseDto> SendTrialStartedEmailAsync(string to, string userName, DateTime trialStartDate, DateTime trialEndDate, string dashboardUrl);
        Task<EmailResponseDto> SendSubscriptionCancelledEmailAsync(string to, string userName, DateTime cancellationDate, DateTime accessEndDate, string planName, string feedbackUrl);
        Task<EmailResponseDto> SendPremiumUpgradeEmailAsync(string to, string userName, DateTime startDate, DateTime nextBillingDate, decimal monthlyPrice, string dashboardUrl);
        Task<EmailResponseDto> SendPaymentSuccessEmailAsync(string to, string userName, decimal amount, string currency, DateTime paymentDate, DateTime nextBillingDate, string invoiceUrl);
        Task<EmailResponseDto> SendPaymentFailedEmailAsync(string to, string userName, decimal amount, string currency, string failureReason, string updatePaymentUrl);
        Task<EmailResponseDto> SendTrialEndingReminderEmailAsync(string to, string userName, DateTime trialEndDate, decimal monthlyPrice, string updatePaymentUrl);
    }
}
