using InvoicingBackend.Data;
using InvoicingBackend.Interfaces;
using InvoicingBackend.Services;
using InvoicingBackend.Models;
using InvoicingBackend.Utils;
using InvoicingBackend.Middleware;
using Backend.Interfaces.Webpage;
using Backend.Services.Webpage;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

// NEW imports
using Microsoft.AspNetCore.HttpOverrides;
using System.Net;

var builder = WebApplication.CreateBuilder(args);

// Add environment variables to configuration FIRST
// This allows env vars to override appsettings.json
builder.Configuration.AddEnvironmentVariables();

// Load environment variables from .env files
// In Docker, env vars are already loaded via docker-compose env_file
// Only manually load .env files when running locally (not in Docker)
var isRunningInDocker = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true" 
                        || File.Exists("/.dockerenv");

if (!isRunningInDocker)
{
    EnvironmentLoader.LoadEnvironmentFiles(builder.Environment);
    // Reload configuration after loading .env files
    builder.Configuration.AddEnvironmentVariables();
}

// Conditionally force Kestrel to listen on all interfaces at port 5000 for Docker compatibility only
// For development, let it use default ports
if (args.Contains("--docker"))
{
    builder.WebHost.UseUrls("http://0.0.0.0:5000");
}

// Add controllers WITH IgnoreCycles
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// Configure EF Core with PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure JWT settings
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

// Configure Email settings (Graph first, SMTP fallback)
builder.Services.Configure<EmailSettings>(options =>
{
    // ---- Graph switch (default true if you want Graph by default) ----
    var useGraphEnv = builder.Configuration["EMAIL_USE_GRAPH"];
    options.UseGraphApi = string.IsNullOrWhiteSpace(useGraphEnv)
        ? true
        : bool.TryParse(useGraphEnv, out var g) && g;

    // ---- Graph creds (from Entra App) ----
    options.TenantId    = builder.Configuration["EMAIL_TENANT_ID"];
    options.ClientId    = builder.Configuration["EMAIL_CLIENT_ID"];
    options.ClientSecret= builder.Configuration["EMAIL_CLIENT_SECRET"]; // SECRET VALUE (not the GUID ID)

    // ---- Identity (common) ----
    options.FromAddress = builder.Configuration["EMAIL_FROM_ADDRESS"] ?? "";
    options.FromName    = builder.Configuration["EMAIL_FROM_NAME"] ?? "Invoicing System";

    // ---- SMTP (optional fallback) ----
    options.SmtpHost    = builder.Configuration["EMAIL_SMTP_HOST"] ?? "smtp.office365.com";
    options.SmtpPort    = int.TryParse(builder.Configuration["EMAIL_SMTP_PORT"], out var port) ? port : 587;
    options.Username    = builder.Configuration["EMAIL_SMTP_USERNAME"] ?? "";
    options.Password    = builder.Configuration["EMAIL_SMTP_PASSWORD"] ?? "";
    options.UseSsl      = bool.TryParse(builder.Configuration["EMAIL_USE_SSL"], out var useSsl) ? useSsl : true;
    options.EnableSsl   = bool.TryParse(builder.Configuration["EMAIL_ENABLE_SSL"], out var enableSsl) ? enableSsl : true;
});

// ---------------------- NEW: Forwarded Headers configuration ----------------------
// This lets the app respect X-Forwarded-For / X-Forwarded-Proto coming from Caddy
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // Optionally restrict to known proxies:
    // options.KnownProxies.Add(IPAddress.Parse("YOUR_PROXY_IP"));
});

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings!.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSettings.SecretKey)),
            ClockSkew = TimeSpan.Zero, // No tolerance for expired tokens
            RequireExpirationTime = true,
            RequireSignedTokens = true
        };
        
        // Security: Don't expose detailed JWT validation errors in production
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                // Log the error for debugging (visible in server logs)
                // Don't add to headers as exception messages may contain invalid characters
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                // Customize 401 response
                context.HandleResponse();
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                var result = System.Text.Json.JsonSerializer.Serialize(new { message = "Unauthorized access. Please login." });
                return context.Response.WriteAsync(result);
            }
        };
    });

builder.Services.AddAuthorization();

// Register custom services.
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<ISystemSetupService, SystemSetupService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<IInvoiceTemplateService, InvoiceTemplateService>();
builder.Services.AddScoped<IDocumentTypeService, DocumentTypeService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IStripeService, StripeService>();

// Webpage services
builder.Services.AddScoped<IWaitlistService, WaitlistService>();
builder.Services.AddScoped<IContactMessageService, ContactMessageService>();
// Add Swagger.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ---------------------- CORS ----------------------
// Register both a permissive default policy for dev and a production policy for the live domain.
// In Development we'll keep the existing default policy; in Production we'll use "AllowFrontend".
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });

    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("https://e-nvoicing.com", "https://www.e-nvoicing.com")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// SECURITY: Only enable Swagger in Development environment
// Never expose API documentation in production
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Serve static files
app.UseStaticFiles();

// ---------------------- Use forwarded headers + select CORS policy ----------------------
// Use forwarded headers early so authentication and URL-generation see the correct proto/host.
app.UseForwardedHeaders();

// Add security headers to all responses
app.UseSecurityHeaders();

// Add rate limiting to prevent abuse (100 requests per minute per IP)
if (app.Environment.IsProduction())
{
    app.UseRateLimiting(requestLimit: 100, timeWindowSeconds: 60);
}

// If we're in Production, enable the named policy for the frontend domain.
// Otherwise (Development) use the default policy that allows localhost dev ports.
if (app.Environment.IsProduction())
{
    app.UseCors("AllowFrontend");
}
else
{
    app.UseCors();
}

app.UseAuthentication();
app.UseAuthorization();

// Add admin audit logging after authentication/authorization
app.UseAdminAuditLogging();

app.MapControllers();

// ─── APPLY MIGRATIONS ON STARTUP ──────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
    db.Database.Migrate();
    
    // Seed admin user (support@e-nvoicing.com)
    await AdminSeeder.SeedAdminUserAsync(db);
    
    // Document types are seeded via migration
    
    // Seed invoice templates
    await InvoiceTemplateSeeder.SeedInvoiceTemplatesAsync(db);
}
// ─────────────────────────────────────────────────────────────────────────────────

app.Run();
