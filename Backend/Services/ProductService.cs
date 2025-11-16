using InvoicingBackend.Data;
using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using InvoicingBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace InvoicingBackend.Services
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;

        public ProductService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductDto>> GetAllProductsAsync(ProductSearchDto? searchDto, int userId)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Where(p => p.UserId == userId) // Filter by user
                .AsQueryable();

            if (searchDto != null)
            {                if (!string.IsNullOrWhiteSpace(searchDto.SearchTerm))
                {
                    query = query.Where(p => p.Name.Contains(searchDto.SearchTerm) ||
                                           (p.Description != null && p.Description.Contains(searchDto.SearchTerm)));
                }

                if (searchDto.CategoryId.HasValue)
                {
                    query = query.Where(p => p.CategoryId == searchDto.CategoryId.Value);
                }

                if (searchDto.IsService.HasValue)
                {
                    query = query.Where(p => p.IsService == searchDto.IsService.Value);
                }

                if (searchDto.IsActive.HasValue)
                {
                    query = query.Where(p => p.IsActive == searchDto.IsActive.Value);
                }

                // Apply pagination
                query = query.Skip((searchDto.PageNumber - 1) * searchDto.PageSize)
                            .Take(searchDto.PageSize);
            }

            var products = await query.ToListAsync();
            return products.Select(MapToDto);
        }

        // Legacy method for backward compatibility
        public async Task<IEnumerable<ProductDto>> GetAllProductsAsync(ProductSearchDto? searchDto = null)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .AsQueryable();

            if (searchDto != null)
            {
                if (!string.IsNullOrWhiteSpace(searchDto.SearchTerm))
                {
                    query = query.Where(p => p.Name.Contains(searchDto.SearchTerm) ||
                                           (p.Description != null && p.Description.Contains(searchDto.SearchTerm)));
                }

                if (searchDto.CategoryId.HasValue)
                {
                    query = query.Where(p => p.CategoryId == searchDto.CategoryId.Value);
                }

                if (searchDto.IsService.HasValue)
                {
                    query = query.Where(p => p.IsService == searchDto.IsService.Value);
                }

                if (searchDto.IsActive.HasValue)
                {
                    query = query.Where(p => p.IsActive == searchDto.IsActive.Value);
                }

                // Apply pagination
                query = query.Skip((searchDto.PageNumber - 1) * searchDto.PageSize)
                            .Take(searchDto.PageSize);
            }

            var products = await query.ToListAsync();
            return products.Select(MapToDto);
        }

        public async Task<ProductDto> GetProductByIdAsync(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                throw new KeyNotFoundException("Product not found.");

            return MapToDto(product);
        }

        // Tenant-isolated version
        public async Task<ProductDto> GetProductByIdAsync(int id, int userId)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (product == null)
                throw new KeyNotFoundException("Product not found.");

            return MapToDto(product);
        }

        public async Task<ProductDto> CreateProductAsync(ProductDto productDto, string enteredBy)
        {            var product = new Product
            {
                Name = productDto.Name,
                Description = productDto.Description,
                UnitPrice = productDto.UnitPrice,
                CategoryId = productDto.CategoryId,
                StockQuantity = productDto.StockQuantity,
                MinStockLevel = productDto.MinStockLevel,
                TrackInventory = productDto.TrackInventory,
                TaxRate = productDto.TaxRate,
                IsTaxable = productDto.IsTaxable,
                IsActive = productDto.IsActive,
                IsService = productDto.IsService,
                EnteredBy = enteredBy,
                DateEntered = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return await GetProductByIdAsync(product.Id);
        }

        // Tenant-isolated version
        public async Task<ProductDto> CreateProductAsync(ProductDto productDto, int userId)
        {            var product = new Product
            {
                Name = productDto.Name,
                Description = productDto.Description,
                UnitPrice = productDto.UnitPrice,
                CategoryId = productDto.CategoryId,
                StockQuantity = productDto.StockQuantity,
                MinStockLevel = productDto.MinStockLevel,
                TrackInventory = productDto.TrackInventory,
                TaxRate = productDto.TaxRate,
                IsTaxable = productDto.IsTaxable,
                IsActive = productDto.IsActive,
                IsService = productDto.IsService,
                EnteredBy = $"User{userId}",
                DateEntered = DateTime.UtcNow,
                UserId = userId // Set user ownership
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return await GetProductByIdAsync(product.Id, userId);
        }

        public async Task<bool> UpdateProductAsync(int id, ProductDto productDto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return false;

            // Check if price changed for price history
            decimal oldPrice = product.UnitPrice;
            bool priceChanged = oldPrice != productDto.UnitPrice;            product.Name = productDto.Name;
            product.Description = productDto.Description;
            product.UnitPrice = productDto.UnitPrice;
            product.CategoryId = productDto.CategoryId;
            product.StockQuantity = productDto.StockQuantity;
            product.MinStockLevel = productDto.MinStockLevel;
            product.TrackInventory = productDto.TrackInventory;
            product.TaxRate = productDto.TaxRate;
            product.IsTaxable = productDto.IsTaxable;
            product.IsActive = productDto.IsActive;
            product.IsService = productDto.IsService;

            // Add price history entry if price changed
            if (priceChanged)
            {
                var priceHistory = new PriceHistory
                {
                    ProductId = id,
                    OldPrice = oldPrice,
                    NewPrice = productDto.UnitPrice,
                    EnteredBy = "System", // Use BaseEntity property
                    Reason = "Price updated"
                };
                _context.PriceHistories.Add(priceHistory);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // Tenant-isolated version
        public async Task<bool> UpdateProductAsync(int id, ProductDto productDto, int userId)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
            if (product == null) return false;

            // Update logic similar to the original method but with user filtering
            decimal oldPrice = product.UnitPrice;
            bool priceChanged = oldPrice != productDto.UnitPrice;
            
            product.Name = productDto.Name;
            product.Description = productDto.Description;
            product.UnitPrice = productDto.UnitPrice;
            product.CategoryId = productDto.CategoryId;
            product.StockQuantity = productDto.StockQuantity;
            product.MinStockLevel = productDto.MinStockLevel;
            product.TrackInventory = productDto.TrackInventory;
            product.TaxRate = productDto.TaxRate;
            product.IsTaxable = productDto.IsTaxable;
            product.IsActive = productDto.IsActive;
            product.IsService = productDto.IsService;

            if (priceChanged)
            {
                var priceHistory = new PriceHistory
                {
                    ProductId = id,
                    OldPrice = oldPrice,
                    NewPrice = productDto.UnitPrice,
                    UserId = userId, // Use BaseEntity property for multi-tenancy
                    EnteredBy = $"User{userId}", // Use BaseEntity property
                    Reason = "Price updated"
                };
                _context.PriceHistories.Add(priceHistory);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return false;

            product.IsActive = false; // Soft delete
            await _context.SaveChangesAsync();
            return true;
        }

        // Tenant-isolated version
        public async Task<bool> DeleteProductAsync(int id, int userId)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
            if (product == null) return false;

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleProductStatusAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return false;

            product.IsActive = !product.IsActive;
            await _context.SaveChangesAsync();
            return true;
        }

        // Tenant-isolated version
        public async Task<bool> ToggleProductStatusAsync(int id, int userId)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
            if (product == null) return false;

            product.IsActive = !product.IsActive;
            await _context.SaveChangesAsync();
            return true;
        }

        // Category operations
        public async Task<IEnumerable<ProductCategoryDto>> GetAllCategoriesAsync(int userId)
        {
            var categories = await _context.ProductCategories
                .Include(c => c.Products)
                .Where(c => c.IsActive && !c.IsDeleted && c.UserId == userId)
                .OrderBy(c => c.Name)
                .ToListAsync();

            return categories.Select(c => new ProductCategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                IsActive = c.IsActive,
                ProductCount = c.Products.Count(p => p.IsActive && !p.IsDeleted && p.UserId == userId)
            });
        }

        public async Task<ProductCategoryDto> CreateCategoryAsync(ProductCategoryDto categoryDto, int userId)
        {
            var category = new ProductCategory
            {
                Name = categoryDto.Name,
                Description = categoryDto.Description,
                IsActive = categoryDto.IsActive,
                UserId = userId,
                DateEntered = DateTime.UtcNow,
                EnteredBy = userId.ToString()
            };

            _context.ProductCategories.Add(category);
            await _context.SaveChangesAsync();

            return new ProductCategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                IsActive = category.IsActive
            };
        }

        public async Task<bool> UpdateCategoryAsync(int id, ProductCategoryDto categoryDto, int userId)
        {
            var category = await _context.ProductCategories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId && !c.IsDeleted);
            if (category == null) return false;

            category.Name = categoryDto.Name;
            category.Description = categoryDto.Description;
            category.IsActive = categoryDto.IsActive;
            category.MarkAsModified(userId.ToString());

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteCategoryAsync(int id, int userId)
        {
            var category = await _context.ProductCategories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId && !c.IsDeleted);
            if (category == null) return false;

            category.SoftDelete(userId.ToString());
            await _context.SaveChangesAsync();
            return true;
        }

        // Price history
        public async Task<IEnumerable<PriceHistoryDto>> GetProductPriceHistoryAsync(int productId)
        {
            var history = await _context.PriceHistories
                .Where(ph => ph.ProductId == productId)
                .OrderByDescending(ph => ph.DateEntered) // Use BaseEntity property
                .ToListAsync();

            return history.Select(h => new PriceHistoryDto
            {
                Id = h.Id,
                ProductId = h.ProductId,
                OldPrice = h.OldPrice,
                NewPrice = h.NewPrice,
                ChangeDate = h.DateEntered, // Map from BaseEntity property
                ChangedBy = h.EnteredBy, // Map from BaseEntity property
                Reason = h.Reason
            });
        }

        // Tenant-isolated version
        public async Task<IEnumerable<PriceHistoryDto>> GetProductPriceHistoryAsync(int productId, int userId) => 
            await GetProductPriceHistoryAsync(productId); // Delegate to existing method for now

        public async Task<bool> UpdateProductPriceAsync(int productId, decimal newPrice, string changedBy, string? reason = null)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null) return false;

            var oldPrice = product.UnitPrice;
            
            // Update product price
            product.UnitPrice = newPrice;
            
            // Add to price history
            var priceHistory = new PriceHistory
            {
                ProductId = productId,
                OldPrice = oldPrice,
                NewPrice = newPrice,
                EnteredBy = changedBy, // Use BaseEntity property
                Reason = reason ?? "Price update"
            };
            
            _context.PriceHistories.Add(priceHistory);
            await _context.SaveChangesAsync();
            return true;
        }

        // Tenant-isolated version
        public async Task<bool> UpdateProductPriceAsync(int productId, decimal newPrice, int userId, string? reason = null) => 
            await UpdateProductPriceAsync(productId, newPrice, $"User{userId}", reason);

        // Inventory operations
        public async Task<bool> UpdateStockQuantityAsync(int productId, int newQuantity, string updatedBy)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null || !product.TrackInventory) return false;

            product.StockQuantity = newQuantity;
            await _context.SaveChangesAsync();
            return true;
        }

        // Tenant-isolated version
        public async Task<bool> UpdateStockQuantityAsync(int productId, int newQuantity, int userId) => 
            await UpdateStockQuantityAsync(productId, newQuantity, $"User{userId}");

        public async Task<bool> AdjustStockAsync(int productId, int quantityChange, string reason, string updatedBy)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null || !product.TrackInventory) return false;

            product.StockQuantity += quantityChange;
            await _context.SaveChangesAsync();
            return true;
        }

        // Tenant-isolated version
        public async Task<bool> AdjustStockAsync(int productId, int quantityChange, string reason, int userId) => 
            await AdjustStockAsync(productId, quantityChange, reason, $"User{userId}");

        public async Task<IEnumerable<ProductDto>> GetLowStockProductsAsync()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.IsActive && p.TrackInventory && p.StockQuantity <= p.MinStockLevel)
                .ToListAsync();

            return products.Select(MapToDto);
        }

        // Tenant-isolated version
        public async Task<IEnumerable<ProductDto>> GetLowStockProductsAsync(int userId) => 
            (await GetLowStockProductsAsync()).Where(p => p.UserId == userId);

        // Search and filtering
        public async Task<IEnumerable<ProductDto>> SearchProductsAsync(string searchTerm)
        {
            var products = await _context.Products                .Include(p => p.Category)
                .Where(p => p.IsActive && 
                           (p.Name.Contains(searchTerm) || 
                            (p.Description != null && p.Description.Contains(searchTerm))))
                .ToListAsync();

            return products.Select(MapToDto);
        }

        // Tenant-isolated version
        public async Task<IEnumerable<ProductDto>> SearchProductsAsync(string searchTerm, int userId) => 
            (await SearchProductsAsync(searchTerm)).Where(p => p.UserId == userId);

        public async Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(int categoryId)
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.IsActive && p.CategoryId == categoryId)
                .ToListAsync();

            return products.Select(MapToDto);
        }

        // Tenant-isolated version
        public async Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(int categoryId, int userId) => 
            (await GetProductsByCategoryAsync(categoryId)).Where(p => p.UserId == userId);

        public async Task<IEnumerable<ProductDto>> GetActiveProductsAsync()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.IsActive)
                .OrderBy(p => p.Name)
                .ToListAsync();

            return products.Select(MapToDto);
        }

        // Tenant-isolated version
        public async Task<IEnumerable<ProductDto>> GetActiveProductsAsync(int userId) => 
            (await GetActiveProductsAsync()).Where(p => p.UserId == userId);

        public async Task<IEnumerable<ProductDto>> GetServicesAsync()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.IsActive && p.IsService)
                .OrderBy(p => p.Name)
                .ToListAsync();

            return products.Select(MapToDto);
        }

        // Tenant-isolated version
        public async Task<IEnumerable<ProductDto>> GetServicesAsync(int userId) => 
            (await GetServicesAsync()).Where(p => p.UserId == userId);

        public async Task<ProductDto?> GetProductForInvoiceAsync(int productId)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == productId && p.IsActive);

            return product != null ? MapToDto(product) : null;
        }

        // Tenant-isolated version
        public async Task<ProductDto?> GetProductForInvoiceAsync(int productId, int userId) => 
            (await GetProductForInvoiceAsync(productId))?.UserId == userId ? 
                await GetProductForInvoiceAsync(productId) : null;

        private static ProductDto MapToDto(Product product)
        {            return new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                UnitPrice = product.UnitPrice,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.Name,
                StockQuantity = product.StockQuantity,
                MinStockLevel = product.MinStockLevel,
                TrackInventory = product.TrackInventory,
                TaxRate = product.TaxRate,
                IsTaxable = product.IsTaxable,
                IsActive = product.IsActive,
                IsService = product.IsService,
                DateEntered = product.DateEntered,
                EnteredBy = product.EnteredBy,
                UserId = product.UserId
            };
        }
    }
}
