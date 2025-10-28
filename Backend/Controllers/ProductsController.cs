using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace InvoicingBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Require authentication for all endpoints
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ISubscriptionService _subscriptionService;

        public ProductsController(IProductService productService, ISubscriptionService subscriptionService)
        {
            _productService = productService;
            _subscriptionService = subscriptionService;
        }

        // Helper method to get current user ID from JWT token
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                throw new UnauthorizedAccessException("User ID not found in token");
            }
            return userId;
        }

        // GET: api/products
        [HttpGet]
        public async Task<IActionResult> GetProducts([FromQuery] ProductSearchDto? searchDto = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                var products = await _productService.GetAllProductsAsync(searchDto, userId);
                return Ok(products);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching products.", error = ex.Message });
            }
        }

        // GET: api/products/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var product = await _productService.GetProductByIdAsync(id, userId);
                return Ok(product);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Product not found." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the product.", error = ex.Message });
            }
        }

        // POST: api/products
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] ProductDto productDto)
        {
            if (productDto == null)
                return BadRequest(new { message = "Invalid product data." });

            try
            {
                var userId = GetCurrentUserId();
                
                // Check subscription limit for free tier
                var canCreate = await _subscriptionService.CanCreateProductAsync(userId);
                if (!canCreate)
                {
                    return StatusCode(403, new 
                    { 
                        message = "You have reached the maximum number of products for your free tier. Upgrade to premium for unlimited products.",
                        limitReached = true,
                        resource = "products"
                    });
                }
                
                var createdProduct = await _productService.CreateProductAsync(productDto, userId);
                return CreatedAtAction(nameof(GetProduct), new { id = createdProduct.Id }, createdProduct);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the product.", error = ex.Message });
            }
        }

        // PUT: api/products/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductDto productDto)
        {
            if (productDto == null)
                return BadRequest(new { message = "Invalid product data." });

            try
            {
                var userId = GetCurrentUserId();
                var result = await _productService.UpdateProductAsync(id, productDto, userId);
                if (!result)
                    return NotFound(new { message = "Product not found." });

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the product.", error = ex.Message });
            }
        }

        // DELETE: api/products/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _productService.DeleteProductAsync(id, userId);
                if (!result)
                    return NotFound(new { message = "Product not found." });

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the product.", error = ex.Message });
            }
        }

        // PUT: api/products/{id}/toggle-status
        [HttpPut("{id}/toggle-status")]
        public async Task<IActionResult> ToggleProductStatus(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _productService.ToggleProductStatusAsync(id, userId);
                if (!result)
                    return NotFound(new { message = "Product not found." });

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating product status.", error = ex.Message });
            }
        }

        // GET: api/products/categories
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                var userId = GetCurrentUserId();
                var categories = await _productService.GetAllCategoriesAsync(userId);
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching categories.", error = ex.Message });
            }
        }

        // POST: api/products/categories
        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory([FromBody] ProductCategoryDto categoryDto)
        {
            if (categoryDto == null)
                return BadRequest(new { message = "Invalid category data." });

            try
            {
                var userId = GetCurrentUserId();
                
                // Check subscription limit for free tier
                var canCreate = await _subscriptionService.CanCreateCategoryAsync(userId);
                if (!canCreate)
                {
                    return StatusCode(403, new 
                    { 
                        message = "You have reached the maximum number of categories for your free tier. Upgrade to premium for unlimited categories.",
                        limitReached = true,
                        resource = "categories"
                    });
                }
                
                var createdCategory = await _productService.CreateCategoryAsync(categoryDto, userId);
                return Ok(createdCategory);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the category.", error = ex.Message });
            }
        }

        // PUT: api/products/categories/{id}
        [HttpPut("categories/{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] ProductCategoryDto categoryDto)
        {
            if (categoryDto == null)
                return BadRequest(new { message = "Invalid category data." });

            try
            {
                var userId = GetCurrentUserId();
                var result = await _productService.UpdateCategoryAsync(id, categoryDto, userId);
                if (!result)
                    return NotFound(new { message = "Category not found." });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the category.", error = ex.Message });
            }
        }

        // DELETE: api/products/categories/{id}
        [HttpDelete("categories/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _productService.DeleteCategoryAsync(id, userId);
                if (!result)
                    return NotFound(new { message = "Category not found." });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the category.", error = ex.Message });
            }
        }

        // GET: api/products/{id}/price-history
        [HttpGet("{id}/price-history")]
        public async Task<IActionResult> GetProductPriceHistory(int id)
        {
            try
            {
                var history = await _productService.GetProductPriceHistoryAsync(id);
                return Ok(history);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching price history.", error = ex.Message });
            }
        }

        // PUT: api/products/{id}/price
        [HttpPut("{id}/price")]
        public async Task<IActionResult> UpdateProductPrice(int id, [FromBody] UpdatePriceRequest request)
        {
            if (request == null || request.NewPrice < 0)
                return BadRequest(new { message = "Invalid price data." });

            try
            {
                var result = await _productService.UpdateProductPriceAsync(id, request.NewPrice, "SystemAdmin", request.Reason);
                if (!result)
                    return NotFound(new { message = "Product not found." });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the price.", error = ex.Message });
            }
        }

        // PUT: api/products/{id}/inventory
        [HttpPut("{id}/inventory")]
        public async Task<IActionResult> UpdateProductInventory(int id, [FromBody] UpdateInventoryRequest request)
        {
            if (request == null || request.Quantity < 0)
                return BadRequest(new { message = "Invalid inventory data." });

            try
            {
                var result = await _productService.UpdateStockQuantityAsync(id, request.Quantity, "SystemAdmin");
                if (!result)
                    return NotFound(new { message = "Product not found or inventory tracking is disabled." });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the inventory.", error = ex.Message });
            }
        }

        // GET: api/products/low-stock
        [HttpGet("low-stock")]
        public async Task<IActionResult> GetLowStockProducts()
        {
            try
            {
                var userId = GetCurrentUserId();
                var products = await _productService.GetLowStockProductsAsync(userId);
                return Ok(products);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching low stock products.", error = ex.Message });
            }
        }

        // GET: api/products/search
        [HttpGet("search")]
        public async Task<IActionResult> SearchProducts([FromQuery] string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return BadRequest(new { message = "Search term is required." });

            try
            {
                var products = await _productService.SearchProductsAsync(searchTerm);
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while searching products.", error = ex.Message });
            }
        }

        // GET: api/products/active
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveProducts()
        {
            try
            {
                var products = await _productService.GetActiveProductsAsync();
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching active products.", error = ex.Message });
            }
        }

        // GET: api/products/services
        [HttpGet("services")]
        public async Task<IActionResult> GetServices()
        {
            try
            {
                var services = await _productService.GetServicesAsync();
                return Ok(services);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching services.", error = ex.Message });
            }
        }

        // Request models
        public class UpdatePriceRequest
        {
            public decimal NewPrice { get; set; }
            public string? Reason { get; set; }
        }

        public class UpdateInventoryRequest
        {
            public int Quantity { get; set; }
        }
    }
}
