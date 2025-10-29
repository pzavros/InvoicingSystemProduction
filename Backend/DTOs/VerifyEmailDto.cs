namespace InvoicingBackend.DTOs
{
    public class VerifyEmailDto
    {
        public required string Email { get; set; }
        public required string VerificationCode { get; set; }
    }
}
