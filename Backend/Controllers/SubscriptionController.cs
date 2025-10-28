using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InvoicingBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SubscriptionController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;

        public SubscriptionController(ISubscriptionService subscriptionService)
        {
            _subscriptionService = subscriptionService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim ?? "0");
        }

        // GET: api/subscription/status
        [HttpGet("status")]
        public async Task<IActionResult> GetSubscriptionStatus()
        {
            try
            {
                var userId = GetCurrentUserId();
                var status = await _subscriptionService.GetSubscriptionStatusAsync(userId);
                return Ok(status);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching subscription status.", error = ex.Message });
            }
        }

        // GET: api/subscription
        [HttpGet]
        public async Task<IActionResult> GetSubscription()
        {
            try
            {
                var userId = GetCurrentUserId();
                var subscription = await _subscriptionService.GetUserSubscriptionAsync(userId);
                
                if (subscription == null)
                    return NotFound(new { message = "No subscription found." });

                return Ok(subscription);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching subscription.", error = ex.Message });
            }
        }

        // POST: api/subscription/trial
        [HttpPost("trial")]
        public async Task<IActionResult> StartTrial()
        {
            try
            {
                var userId = GetCurrentUserId();
                var subscription = await _subscriptionService.CreateTrialSubscriptionAsync(userId);
                return Ok(subscription);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while starting trial.", error = ex.Message });
            }
        }

        // POST: api/subscription/payment
        [HttpPost("payment")]
        public async Task<IActionResult> ProcessPayment([FromBody] PaymentDto paymentRequest)
        {
            try
            {
                var userId = GetCurrentUserId();
                var payment = await _subscriptionService.ProcessPaymentAsync(
                    userId, 
                    paymentRequest.Amount, 
                    null // paymentMethodId - will be used later with Stripe
                );
                return Ok(payment);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while processing payment.", error = ex.Message });
            }
        }

        // GET: api/subscription/payments
        [HttpGet("payments")]
        public async Task<IActionResult> GetPayments()
        {
            try
            {
                var userId = GetCurrentUserId();
                var payments = await _subscriptionService.GetUserPaymentsAsync(userId);
                return Ok(payments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching payments.", error = ex.Message });
            }
        }

        // DELETE: api/subscription
        [HttpDelete]
        public async Task<IActionResult> CancelSubscription()
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _subscriptionService.CancelSubscriptionAsync(userId);
                
                if (!result)
                    return NotFound(new { message = "No subscription found to cancel." });

                return Ok(new { message = "Subscription cancelled successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while cancelling subscription.", error = ex.Message });
            }
        }

        // POST: api/subscription/extend
        [HttpPost("extend")]
        public async Task<IActionResult> ExtendSubscription([FromQuery] int months = 1)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _subscriptionService.ExtendSubscriptionAsync(userId, months);
                
                if (!result)
                    return NotFound(new { message = "No subscription found to extend." });

                return Ok(new { message = $"Subscription extended by {months} month(s)." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while extending subscription.", error = ex.Message });
            }
        }

        // GET: api/subscription/check-access
        [HttpGet("check-access")]
        public async Task<IActionResult> CheckAccess()
        {
            try
            {
                var userId = GetCurrentUserId();
                var isActive = await _subscriptionService.IsUserActiveSubscriberAsync(userId);
                var isInTrial = await _subscriptionService.IsUserInTrialAsync(userId);
                
                return Ok(new { 
                    hasAccess = isActive,
                    isInTrial = isInTrial,
                    isActiveSubscriber = isActive && !isInTrial
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while checking access.", error = ex.Message });
            }
        }

        // ============= FREEMIUM ENDPOINTS =============

        // GET: api/subscription/tier
        [HttpGet("tier")]
        public async Task<IActionResult> GetTier()
        {
            try
            {
                var userId = GetCurrentUserId();
                var tier = await _subscriptionService.GetUserTierAsync(userId);
                var isPremium = await _subscriptionService.IsPremiumUserAsync(userId);
                
                return Ok(new SubscriptionTierDto
                {
                    Tier = tier,
                    IsPremium = isPremium
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching tier.", error = ex.Message });
            }
        }

        // GET: api/subscription/usage
        [HttpGet("usage")]
        public async Task<IActionResult> GetUsage()
        {
            try
            {
                var userId = GetCurrentUserId();
                var usage = await _subscriptionService.GetUsageStatsAsync(userId);
                return Ok(usage);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching usage stats.", error = ex.Message });
            }
        }

        // GET: api/subscription/can-create/{resource}
        [HttpGet("can-create/{resource}")]
        public async Task<IActionResult> CanCreateResource(string resource)
        {
            try
            {
                var userId = GetCurrentUserId();
                bool canCreate = false;
                
                switch (resource.ToLower())
                {
                    case "client":
                        canCreate = await _subscriptionService.CanCreateClientAsync(userId);
                        break;
                    case "category":
                        canCreate = await _subscriptionService.CanCreateCategoryAsync(userId);
                        break;
                    case "product":
                        canCreate = await _subscriptionService.CanCreateProductAsync(userId);
                        break;
                    case "invoice":
                        canCreate = await _subscriptionService.CanCreateInvoiceAsync(userId);
                        break;
                    case "template":
                        canCreate = await _subscriptionService.CanCreateTemplateAsync(userId);
                        break;
                    default:
                        return BadRequest(new { message = "Invalid resource type." });
                }
                
                return Ok(new { canCreate, resource });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while checking limits.", error = ex.Message });
            }
        }
    }
}
