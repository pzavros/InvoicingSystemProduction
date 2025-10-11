using InvoicingBackend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InvoicingBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DocumentTypesController : ControllerBase
    {
        private readonly IDocumentTypeService _documentTypeService;

        public DocumentTypesController(IDocumentTypeService documentTypeService)
        {
            _documentTypeService = documentTypeService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllDocumentTypes()
        {
            try
            {
                var documentTypes = await _documentTypeService.GetAllDocumentTypesAsync();
                return Ok(documentTypes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving document types.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDocumentTypeById(int id)
        {
            try
            {
                var documentType = await _documentTypeService.GetDocumentTypeByIdAsync(id);
                
                if (documentType == null)
                    return NotFound(new { message = "Document type not found." });

                return Ok(documentType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the document type.", error = ex.Message });
            }
        }

        [HttpGet("by-code/{code}")]
        public async Task<IActionResult> GetDocumentTypeByCode(string code)
        {
            try
            {
                var documentType = await _documentTypeService.GetDocumentTypeByCodeAsync(code);
                
                if (documentType == null)
                    return NotFound(new { message = "Document type not found." });

                return Ok(documentType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the document type.", error = ex.Message });
            }
        }
    }
}
