using System.ComponentModel.DataAnnotations;

namespace InvoicingBackend.DTOs
{
    public class VerifyOtpDto
    {
        [Required]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "OTP must be exactly 6 digits")]
        [RegularExpression(@"^\d{6}$", ErrorMessage = "OTP must contain only digits")]
        public required string Otp { get; set; }
    }

    public class RequestPasswordChangeOtpDto
    {
        // No current password required - just request OTP directly
    }

    public class VerifyPasswordChangeOtpDto
    {
        [Required]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "OTP must be exactly 6 digits")]
        [RegularExpression(@"^\d{6}$", ErrorMessage = "OTP must contain only digits")]
        public required string Otp { get; set; }
    }

    public class ChangePasswordWithOtpDto
    {
        [Required]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "OTP must be exactly 6 digits")]
        [RegularExpression(@"^\d{6}$", ErrorMessage = "OTP must contain only digits")]
        public required string Otp { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "New password must be between 6 and 100 characters")]
        public required string NewPassword { get; set; }
    }
}
