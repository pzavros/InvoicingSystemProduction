using InvoicingBackend.DTOs;
using InvoicingBackend.Models;

namespace InvoicingBackend.Interfaces
{
    public interface IProductService
    {
        // Product CRUD operations with user filtering
        Task<IEnumerable<ProductDto>> GetAllProductsAsync(ProductSearchDto? searchDto, int userId);
        Task<ProductDto> GetProductByIdAsync(int id, int userId);
        Task<ProductDto> CreateProductAsync(ProductDto productDto, int userId);
        Task<bool> UpdateProductAsync(int id, ProductDto productDto, int userId);
        Task<bool> DeleteProductAsync(int id, int userId);
        Task<bool> ToggleProductStatusAsync(int id, int userId);
        
        // Legacy methods for backward compatibility (can be removed later)
        Task<IEnumerable<ProductDto>> GetAllProductsAsync(ProductSearchDto? searchDto = null);
        Task<ProductDto> GetProductByIdAsync(int id);
        Task<ProductDto> CreateProductAsync(ProductDto productDto, string enteredBy);
        Task<bool> UpdateProductAsync(int id, ProductDto productDto);
        Task<bool> DeleteProductAsync(int id);
        Task<bool> ToggleProductStatusAsync(int id);
        
        // Category operations
        Task<IEnumerable<ProductCategoryDto>> GetAllCategoriesAsync(int userId);
        Task<ProductCategoryDto> CreateCategoryAsync(ProductCategoryDto categoryDto, int userId);
        Task<bool> UpdateCategoryAsync(int id, ProductCategoryDto categoryDto, int userId);
        Task<bool> DeleteCategoryAsync(int id, int userId);
        
        // Price history
        Task<IEnumerable<PriceHistoryDto>> GetProductPriceHistoryAsync(int productId, int userId);
        Task<IEnumerable<PriceHistoryDto>> GetProductPriceHistoryAsync(int productId);
        Task<bool> UpdateProductPriceAsync(int productId, decimal newPrice, int userId, string? reason = null);
        Task<bool> UpdateProductPriceAsync(int productId, decimal newPrice, string changedBy, string? reason = null);
        
        // Inventory operations
        Task<bool> UpdateStockQuantityAsync(int productId, int newQuantity, int userId);
        Task<bool> UpdateStockQuantityAsync(int productId, int newQuantity, string updatedBy);
        Task<bool> AdjustStockAsync(int productId, int quantityChange, string reason, int userId);
        Task<bool> AdjustStockAsync(int productId, int quantityChange, string reason, string updatedBy);
        Task<IEnumerable<ProductDto>> GetLowStockProductsAsync(int userId);
        Task<IEnumerable<ProductDto>> GetLowStockProductsAsync();
        
        // Search and filtering
        Task<IEnumerable<ProductDto>> SearchProductsAsync(string searchTerm, int userId);
        Task<IEnumerable<ProductDto>> SearchProductsAsync(string searchTerm);
        Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(int categoryId, int userId);
        Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(int categoryId);
        Task<IEnumerable<ProductDto>> GetActiveProductsAsync(int userId);
        Task<IEnumerable<ProductDto>> GetActiveProductsAsync();
        Task<IEnumerable<ProductDto>> GetServicesAsync(int userId);
        Task<IEnumerable<ProductDto>> GetServicesAsync();
        
        // For invoice integration
        Task<ProductDto?> GetProductForInvoiceAsync(int productId, int userId);
        Task<ProductDto?> GetProductForInvoiceAsync(int productId);
    }
}
