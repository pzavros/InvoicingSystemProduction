using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace InvoicingBackend.Attributes
{
    public class AdminAuthAttribute : Attribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            
            if (!user.Identity?.IsAuthenticated == true)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var isAdminClaim = user.FindFirst("IsAdmin")?.Value;
            if (isAdminClaim != "True")
            {
                context.Result = new ForbidResult();
                return;
            }
        }
    }
}
