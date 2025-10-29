using System.Security.Claims;
using System.Text;

namespace InvoicingBackend.Middleware
{
    /// <summary>
    /// Middleware to log all admin endpoint requests for security auditing
    /// </summary>
    public class AdminAuditLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<AdminAuditLoggingMiddleware> _logger;

        public AdminAuditLoggingMiddleware(
            RequestDelegate next, 
            ILogger<AdminAuditLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Only log admin endpoints
            if (context.Request.Path.StartsWithSegments("/api/admin"))
            {
                var ipAddress = GetClientIpAddress(context);
                var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "Anonymous";
                var userEmail = context.User.FindFirst(ClaimTypes.Email)?.Value ?? "Unknown";
                var isAdmin = context.User.FindFirst("IsAdmin")?.Value ?? "false";
                var method = context.Request.Method;
                var path = context.Request.Path;
                var queryString = context.Request.QueryString;

                // Log the request BEFORE processing
                _logger.LogWarning(
                    "ADMIN_REQUEST | IP: {IpAddress} | User: {UserId} ({Email}) | IsAdmin: {IsAdmin} | {Method} {Path}{QueryString}",
                    ipAddress, userId, userEmail, isAdmin, method, path, queryString
                );

                // Capture the original response body stream
                var originalBodyStream = context.Response.Body;

                using (var responseBody = new MemoryStream())
                {
                    context.Response.Body = responseBody;

                    try
                    {
                        await _next(context);

                        // Log the response status
                        _logger.LogWarning(
                            "ADMIN_RESPONSE | IP: {IpAddress} | User: {UserId} | {Method} {Path} | Status: {StatusCode}",
                            ipAddress, userId, method, path, context.Response.StatusCode
                        );
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex,
                            "ADMIN_ERROR | IP: {IpAddress} | User: {UserId} | {Method} {Path} | Error: {Message}",
                            ipAddress, userId, method, path, ex.Message
                        );
                        throw;
                    }
                    finally
                    {
                        // Copy response back to original stream
                        responseBody.Seek(0, SeekOrigin.Begin);
                        await responseBody.CopyToAsync(originalBodyStream);
                    }
                }
            }
            else
            {
                await _next(context);
            }
        }

        private string GetClientIpAddress(HttpContext context)
        {
            var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                return forwardedFor.Split(',')[0].Trim();
            }

            var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIp))
            {
                return realIp;
            }

            return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }
    }

    public static class AdminAuditLoggingMiddlewareExtensions
    {
        public static IApplicationBuilder UseAdminAuditLogging(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<AdminAuditLoggingMiddleware>();
        }
    }
}
