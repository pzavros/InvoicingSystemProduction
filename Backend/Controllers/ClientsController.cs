using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using System.Security.Claims;

namespace InvoicingBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClientsController : ControllerBase
    {
        private readonly IClientService _clientService;

        public ClientsController(IClientService clientService)
        {
            _clientService = clientService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
        }

        private string GetCurrentUserName()
        {
            var userNameClaim = User.FindFirst(ClaimTypes.Name);
            return userNameClaim?.Value ?? "System";
        }

        // GET: api/clients
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientDto>>> GetClients([FromQuery] string? search = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized("Invalid user token");

                var clients = string.IsNullOrEmpty(search) 
                    ? await _clientService.GetAllClientsAsync(userId)
                    : await _clientService.SearchClientsAsync(search, userId);

                return Ok(clients);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/clients/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ClientDto>> GetClient(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized("Invalid user token");

                var client = await _clientService.GetClientByIdAsync(id, userId);
                if (client == null)
                    return NotFound($"Client with ID {id} not found");

                return Ok(client);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/clients/email/{email}
        [HttpGet("email/{email}")]
        public async Task<ActionResult<ClientDto>> GetClientByEmail(string email)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized("Invalid user token");

                var client = await _clientService.GetClientByEmailAsync(email, userId);
                if (client == null)
                    return NotFound($"Client with email {email} not found");

                return Ok(client);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/clients
        [HttpPost]
        public async Task<ActionResult<ClientDto>> CreateClient([FromBody] CreateClientDto createClientDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized("Invalid user token");

                var userName = GetCurrentUserName();

                // Check if client with same email already exists
                var existingClient = await _clientService.GetClientByEmailAsync(createClientDto.Email, userId);
                if (existingClient != null)
                    return Conflict($"Client with email {createClientDto.Email} already exists");

                var client = await _clientService.CreateClientAsync(createClientDto, userId, userName);
                return CreatedAtAction(nameof(GetClient), new { id = client.Id }, client);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/clients/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<ClientDto>> UpdateClient(int id, [FromBody] UpdateClientDto updateClientDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (id != updateClientDto.Id)
                    return BadRequest("Client ID mismatch");

                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized("Invalid user token");

                var userName = GetCurrentUserName();

                // Check if client exists
                var existsResult = await _clientService.ClientExistsAsync(id, userId);
                if (!existsResult)
                    return NotFound($"Client with ID {id} not found");

                // Check if email is being changed to an existing email
                var existingClient = await _clientService.GetClientByEmailAsync(updateClientDto.Email, userId);
                if (existingClient != null && existingClient.Id != id)
                    return Conflict($"Another client with email {updateClientDto.Email} already exists");

                var updatedClient = await _clientService.UpdateClientAsync(updateClientDto, userId, userName);
                if (updatedClient == null)
                    return NotFound($"Client with ID {id} not found");

                return Ok(updatedClient);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/clients/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClient(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized("Invalid user token");

                var userName = GetCurrentUserName();

                var result = await _clientService.DeleteClientAsync(id, userId, userName);
                if (!result)
                    return NotFound($"Client with ID {id} not found");

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
