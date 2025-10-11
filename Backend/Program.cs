using InvoicingBackend.Data;
using InvoicingBackend.Interfaces;
using InvoicingBackend.Services;
using InvoicingBackend.Models;
using InvoicingBackend.Utils;
using Backend.Interfaces.Webpage;
using Backend.Services.Webpage;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env files
EnvironmentLoader.LoadEnvironmentFiles(builder.Environment);

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

// Configure Email settings
builder.Services.Configure<EmailSettings>(options =>
{
    options.SmtpHost = Environment.GetEnvironmentVariable("EMAIL_SMTP_HOST") ?? "smtp.office365.com";
    options.SmtpPort = int.Parse(Environment.GetEnvironmentVariable("EMAIL_SMTP_PORT") ?? "587");
    options.Username = Environment.GetEnvironmentVariable("EMAIL_SMTP_USERNAME") ?? "";
    options.Password = Environment.GetEnvironmentVariable("EMAIL_SMTP_PASSWORD") ?? "";
    options.FromName = Environment.GetEnvironmentVariable("EMAIL_FROM_NAME") ?? "Invoicing System";
    options.FromAddress = Environment.GetEnvironmentVariable("EMAIL_FROM_ADDRESS") ?? "";
    options.UseSsl = bool.Parse(Environment.GetEnvironmentVariable("EMAIL_USE_SSL") ?? "true");
    options.EnableSsl = bool.Parse(Environment.GetEnvironmentVariable("EMAIL_ENABLE_SSL") ?? "true");
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
            ClockSkew = TimeSpan.Zero
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

// Webpage services
builder.Services.AddScoped<IWaitlistService, WaitlistService>();
builder.Services.AddScoped<IContactMessageService, ContactMessageService>();
// Add Swagger.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add permissive CORS for local debugging.
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Serve static files
app.UseStaticFiles();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ─── APPLY MIGRATIONS ON STARTUP ──────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
    
    // Seed demo users
    await UserSeeder.SeedUsersAsync(db);
    
    // Seed admin user
    await AdminSeeder.SeedAdminUserAsync(db);
    
    // Document types are seeded via migration
    
    // Seed invoice templates
    await InvoiceTemplateSeeder.SeedInvoiceTemplatesAsync(db);
}
// ─────────────────────────────────────────────────────────────────────────────────

app.Run();