namespace InvoicingBackend.Models
{
    public class EmailSettings
    {
        // --- Use Graph (no SMTP) ---
        public bool UseGraphApi { get; set; } = true;

        // --- Graph credentials (Entra ID app) ---
        public string? TenantId { get; set; }
        public string? ClientId { get; set; }
        public string? ClientSecret { get; set; }  

        // --- Identity (common) ---
        public string FromName { get; set; } = string.Empty;
        public string FromAddress { get; set; } = string.Empty;

        // --- SMTP (optional fallback) ---
        public string SmtpHost { get; set; } = string.Empty;
        public int SmtpPort { get; set; } = 587;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool UseSsl { get; set; } = true;
        public bool EnableSsl { get; set; } = true;
    }
}
