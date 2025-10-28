namespace InvoicingBackend.DTOs
{
    public class SubscriptionUsageDto
    {
        public string Tier { get; set; } = "free";
        public bool IsPremium { get; set; }
        
        // Current usage
        public int ClientsCount { get; set; }
        public int CategoriesCount { get; set; }
        public int ProductsCount { get; set; }
        public int InvoicesThisMonth { get; set; }
        public int TemplatesCount { get; set; }
        
        // Limits
        public int MaxClients { get; set; }
        public int MaxCategories { get; set; }
        public int MaxProducts { get; set; }
        public int MaxInvoicesPerMonth { get; set; }
        public int MaxTemplates { get; set; }
        
        // Can create flags
        public bool CanCreateClient { get; set; }
        public bool CanCreateCategory { get; set; }
        public bool CanCreateProduct { get; set; }
        public bool CanCreateInvoice { get; set; }
        public bool CanCreateTemplate { get; set; }
        
        // Additional info
        public string CurrentMonth { get; set; } = string.Empty;
        public DateTime? NextResetDate { get; set; }
    }
    
    public class SubscriptionTierDto
    {
        public string Tier { get; set; } = "free";
        public bool IsPremium { get; set; }
    }
}
