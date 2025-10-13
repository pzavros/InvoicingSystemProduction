using InvoicingBackend.DTOs;

namespace InvoicingBackend.Interfaces
{
    public interface IEmailService
    {
        Task<EmailResponseDto> SendEmailAsync(EmailDto emailDto);
Task<EmailResponseDto> SendEmailAsync(string to, string subject, string body, bool isHtml = true);
        Task<EmailResponseDto> SendInvoiceEmailAsync(string to, string invoiceNumber, byte[] pdfContent);
        Task<EmailResponseDto> SendWelcomeEmailAsync(string to, string userName);
        Task<EmailResponseDto> SendPasswordResetEmailAsync(string to, string resetToken);
        Task<EmailResponseDto> SendPasswordChangeOtpEmailAsync(string to, string userName, string otp);
    }
}
