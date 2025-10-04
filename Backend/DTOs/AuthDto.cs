namespace InvoicingBackend.DTOs
{
    public class LoginDto
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class RegisterDto
    {
        public required string Email { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Password { get; set; }
        public required string ConfirmPassword { get; set; }
    }

    public class AuthResponseDto
    {
        public required string Token { get; set; }
        public required UserDto User { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
