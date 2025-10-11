using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InvoicingBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Require authentication for email endpoints
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<EmailController> _logger;

        public EmailController(IEmailService emailService, ILogger<EmailController> logger)
        {
            _emailService = emailService;
            _logger = logger;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendEmail([FromBody] EmailDto emailDto)
        {
            try
            {
                if (string.IsNullOrEmpty(emailDto.To) || string.IsNullOrEmpty(emailDto.Subject))
                {
                    return BadRequest("To and Subject are required fields");
                }

                var result = await _emailService.SendEmailAsync(emailDto);
                
                if (result.Success)
                {
                    return Ok(result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email");
                return StatusCode(500, new EmailResponseDto 
                { 
                    Success = false, 
                    Message = "Internal server error while sending email" 
                });
            }
        }

        [HttpPost("send-simple")]
        [AllowAnonymous]
        public async Task<IActionResult> SendSimpleEmail([FromBody] SimpleEmailDto emailDto)
        {
            try
            {
                if (string.IsNullOrEmpty(emailDto.To) || string.IsNullOrEmpty(emailDto.Subject))
                {
                    return BadRequest("To and Subject are required fields");
                }

                var result = await _emailService.SendEmailAsync(emailDto.To, emailDto.Subject, emailDto.Body, emailDto.IsHtml);
                
                if (result.Success)
                {
                    return Ok(result);
                }
                
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending simple email");
                return StatusCode(500, new EmailResponseDto 
                { 
                    Success = false, 
                    Message = "Internal server error while sending email" 
                });
            }
        }

        [HttpPost("send-invoice/{invoiceId}")]
        public async Task<IActionResult> SendInvoiceEmail(int invoiceId, [FromBody] InvoiceEmailDto emailDto)
        {
            try
            {
                if (string.IsNullOrEmpty(emailDto.To))
                {
                    return BadRequest("To field is required");
                }

                // Here you would typically:
                // 1. Fetch the invoice from the database
                // 2. Generate the PDF
                // 3. Send the email with the PDF attachment
                
                // For now, we'll return a placeholder response
                // You'll need to integrate this with your existing invoice service
                
                return Ok(new EmailResponseDto 
                { 
                    Success = false, 
                    Message = "Invoice email functionality needs to be integrated with your existing invoice service" 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending invoice email");
                return StatusCode(500, new EmailResponseDto 
                { 
                    Success = false, 
                    Message = "Internal server error while sending invoice email" 
                });
            }
        }

        [HttpPost("test-connection")]
        [AllowAnonymous]
        public async Task<IActionResult> TestEmailConnection()
        {
            try
            {
                // Send a test email to verify the configuration
                var testResult = await _emailService.SendEmailAsync(
                    "test@example.com", 
                    "Test Email - Configuration Check", 
                    "This is a test email to verify email configuration is working properly."
                );

                return Ok(new { 
                    configurationValid = testResult.Success,
                    message = testResult.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing email connection");
                return StatusCode(500, new { 
                    configurationValid = false,
                    message = "Failed to test email connection"
                });
            }
        }
    }

    public class SimpleEmailDto
    {
        public string To { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public bool IsHtml { get; set; } = true;
    }

    public class InvoiceEmailDto
    {
        public string To { get; set; } = string.Empty;
        public string? CustomMessage { get; set; }
    }
}
