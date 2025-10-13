namespace InvoicingBackend.DTOs
{
    public class UserPreferencesDto
    {
        public string? Currency { get; set; }
        public string? DateFormat { get; set; }
        public string? Language { get; set; }
        public bool EmailNotifications { get; set; }
        public bool DarkMode { get; set; }
    }
}
