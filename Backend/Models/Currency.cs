// Models/Currency.cs
using System.ComponentModel.DataAnnotations;

namespace InvoicingBackend.Models
{
    public class Currency
    {
        public int Id { get; set; }
        [Required]
        public string Code { get; set; } = null!;
        public string? Symbol { get; set; }
        public string? Name { get; set; }
    }
}