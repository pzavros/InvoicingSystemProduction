using Backend.DTOs.Webpage;
using Backend.Interfaces.Webpage;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers.Webpage
{
    [ApiController]
    [Route("api/webpage/contact")]
    public class ContactMessageController : ControllerBase
    {
        private readonly IContactMessageService _contactMessageService;
        private readonly ILogger<ContactMessageController> _logger;

        public ContactMessageController(IContactMessageService contactMessageService, ILogger<ContactMessageController> logger)
        {
            _contactMessageService = contactMessageService;
            _logger = logger;
        }

        /// <summary>
        /// Submit a new contact message
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ContactMessageDto>> CreateMessage([FromBody] CreateContactMessageDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var message = await _contactMessageService.CreateMessageAsync(createDto);
                _logger.LogInformation("New contact message created with ID: {MessageId}", message.Id);
                
                return CreatedAtAction(nameof(GetMessage), new { id = message.Id }, message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating contact message");
                return StatusCode(500, new { message = "An error occurred while processing your message. Please try again." });
            }
        }

        /// <summary>
        /// Get all contact messages with pagination and optional status filter
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ContactMessageDto>>> GetMessages(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] string? status = null)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 50;

                var messages = await _contactMessageService.GetMessagesAsync(page, pageSize, status);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contact messages");
                return StatusCode(500, new { message = "An error occurred while retrieving messages." });
            }
        }

        /// <summary>
        /// Get a specific contact message by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ContactMessageDto>> GetMessage(int id)
        {
            try
            {
                var message = await _contactMessageService.GetMessageByIdAsync(id);
                if (message == null)
                {
                    return NotFound(new { message = "Contact message not found." });
                }

                return Ok(message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contact message {MessageId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the message." });
            }
        }

        /// <summary>
        /// Get contact message statistics
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult<ContactMessageStatsDto>> GetStats()
        {
            try
            {
                var stats = await _contactMessageService.GetStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contact message statistics");
                return StatusCode(500, new { message = "An error occurred while retrieving statistics." });
            }
        }

        /// <summary>
        /// Mark a message as read
        /// </summary>
        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                var success = await _contactMessageService.MarkAsReadAsync(id);
                if (!success)
                {
                    return NotFound(new { message = "Contact message not found." });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking message {MessageId} as read", id);
                return StatusCode(500, new { message = "An error occurred while updating the message." });
            }
        }

        /// <summary>
        /// Mark a message as replied
        /// </summary>
        [HttpPatch("{id}/replied")]
        public async Task<IActionResult> MarkAsReplied(int id)
        {
            try
            {
                var success = await _contactMessageService.MarkAsRepliedAsync(id);
                if (!success)
                {
                    return NotFound(new { message = "Contact message not found." });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking message {MessageId} as replied", id);
                return StatusCode(500, new { message = "An error occurred while updating the message." });
            }
        }

        /// <summary>
        /// Update message status
        /// </summary>
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto updateDto)
        {
            try
            {
                var validStatuses = new[] { "New", "InProgress", "Resolved", "Closed" };
                if (!validStatuses.Contains(updateDto.Status))
                {
                    return BadRequest(new { message = "Invalid status. Valid statuses are: " + string.Join(", ", validStatuses) });
                }

                var success = await _contactMessageService.UpdateStatusAsync(id, updateDto.Status);
                if (!success)
                {
                    return NotFound(new { message = "Contact message not found." });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating status for message {MessageId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the message." });
            }
        }

        /// <summary>
        /// Add admin notes to a message
        /// </summary>
        [HttpPatch("{id}/notes")]
        public async Task<IActionResult> AddAdminNotes(int id, [FromBody] AddNotesDto notesDto)
        {
            try
            {
                var success = await _contactMessageService.AddAdminNotesAsync(id, notesDto.Notes);
                if (!success)
                {
                    return NotFound(new { message = "Contact message not found." });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding notes to message {MessageId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the message." });
            }
        }

        /// <summary>
        /// Delete a contact message
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            try
            {
                var success = await _contactMessageService.DeleteMessageAsync(id);
                if (!success)
                {
                    return NotFound(new { message = "Contact message not found." });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting message {MessageId}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the message." });
            }
        }
    }

    // Supporting DTOs for controller actions
    public class UpdateStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }

    public class AddNotesDto
    {
        public string Notes { get; set; } = string.Empty;
    }
}
