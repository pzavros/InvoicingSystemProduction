using System.Collections.Concurrent;
using System.Net;

namespace InvoicingBackend.Middleware
{
    /// <summary>
    /// Middleware to prevent brute force attacks and API abuse by limiting requests per IP
    /// </summary>
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private static readonly ConcurrentDictionary<string, RequestCounter> _requests = new();
        private readonly int _requestLimit;
        private readonly TimeSpan _timeWindow;

        public RateLimitingMiddleware(RequestDelegate next, int requestLimit = 100, int timeWindowSeconds = 60)
        {
            _next = next;
            _requestLimit = requestLimit;
            _timeWindow = TimeSpan.FromSeconds(timeWindowSeconds);
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var ipAddress = GetClientIpAddress(context);
            
            // Skip rate limiting for health checks
            if (context.Request.Path.StartsWithSegments("/api/health"))
            {
                await _next(context);
                return;
            }

            var counter = _requests.GetOrAdd(ipAddress, _ => new RequestCounter());

            lock (counter)
            {
                var now = DateTime.UtcNow;
                
                // Remove old requests outside the time window
                counter.Requests.RemoveAll(r => now - r > _timeWindow);
                
                // Check if limit exceeded
                if (counter.Requests.Count >= _requestLimit)
                {
                    context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                    context.Response.Headers["Retry-After"] = _timeWindow.TotalSeconds.ToString();
                    return;
                }
                
                // Add current request
                counter.Requests.Add(now);
            }

            await _next(context);
        }

        private string GetClientIpAddress(HttpContext context)
        {
            // Check for forwarded IP (from proxy/load balancer)
            var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                return forwardedFor.Split(',')[0].Trim();
            }

            // Check X-Real-IP header
            var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIp))
            {
                return realIp;
            }

            // Fall back to connection remote IP
            return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }

        private class RequestCounter
        {
            public List<DateTime> Requests { get; } = new List<DateTime>();
        }
    }

    public static class RateLimitingMiddlewareExtensions
    {
        public static IApplicationBuilder UseRateLimiting(
            this IApplicationBuilder builder, 
            int requestLimit = 100, 
            int timeWindowSeconds = 60)
        {
            return builder.UseMiddleware<RateLimitingMiddleware>(requestLimit, timeWindowSeconds);
        }
    }
}
