namespace InvoicingBackend.Models
{
    public class ProductCategory : BaseEntity
    {
        // Remove duplicate Id since it's now in BaseEntity
        public string Name { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        
        // Navigation property
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
