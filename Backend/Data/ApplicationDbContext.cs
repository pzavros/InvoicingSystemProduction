using InvoicingBackend.Models;
using Backend.Models.Webpage;
using Microsoft.EntityFrameworkCore;

namespace InvoicingBackend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceItem> InvoiceItems { get; set; }
        public DbSet<SystemSetup> SystemSetups { get; set; }
        public DbSet<Currency> Currencies { get; set; }
        public DbSet<Status> Statuses { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductCategory> ProductCategories { get; set; }
        public DbSet<PriceHistory> PriceHistories { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<InvoiceTemplate> InvoiceTemplates { get; set; }
        public DbSet<DocumentType> DocumentTypes { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<InvoiceQuota> InvoiceQuotas { get; set; }
        public DbSet<SupportTicket> SupportTickets { get; set; }
        
        // Webpage Models
        public DbSet<WaitlistEntry> WaitlistEntries { get; set; }
        public DbSet<ContactMessage> ContactMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // configure Logo as binary (PostgreSQL uses bytea)
            modelBuilder.Entity<SystemSetup>()
                .Property(x => x.Logo)
                .HasColumnType("bytea")
                .IsRequired(false);

            // seed currencies
            modelBuilder.Entity<Currency>().HasData(
                new Currency { Id = 1, Code = "EUR", Symbol = "€", Name = "Euro" },
                new Currency { Id = 2, Code = "USD", Symbol = "$", Name = "United States dollar" },
                new Currency { Id = 3, Code = "GBP", Symbol = "£", Name = "British pound" }
            );

            // seed statuses
            modelBuilder.Entity<Status>().HasData(
                new Status { StatusId = 1, Name = "Draft" },
                new Status { StatusId = 2, Name = "Unpaid" },
                new Status { StatusId = 3, Name = "Paid" },
                new Status { StatusId = 4, Name = "Deleted" },
                new Status { StatusId = 5, Name = "Overdue" }
            );            // Invoice → InvoiceItems relationship
            modelBuilder.Entity<InvoiceItem>()
                .HasOne(ii => ii.Invoice)
                .WithMany(i => i.Items)
                .HasForeignKey(ii => ii.InvoiceId);

            // Product → Category relationship
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            // Product → PriceHistory relationship
            modelBuilder.Entity<PriceHistory>()
                .HasOne(ph => ph.Product)
                .WithMany(p => p.PriceHistory)
                .HasForeignKey(ph => ph.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // InvoiceItem → Product relationship (optional)
            modelBuilder.Entity<InvoiceItem>()
                .HasOne(ii => ii.Product)
                .WithMany(p => p.InvoiceItems)
                .HasForeignKey(ii => ii.ProductId)
                .OnDelete(DeleteBehavior.SetNull);

            // Product → InvoiceItems relationship (optional)
            modelBuilder.Entity<InvoiceItem>()
                .HasOne(ii => ii.Product)
                .WithMany(p => p.InvoiceItems)
                .HasForeignKey(ii => ii.ProductId)
                .IsRequired(false);

            // ProductCategory → Products relationship
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId)
                .IsRequired(false);

            // Product → PriceHistory relationship
            modelBuilder.Entity<PriceHistory>()
                .HasOne(ph => ph.Product)
                .WithMany(p => p.PriceHistory)
                .HasForeignKey(ph => ph.ProductId);

            // User → Subscription relationship (One-to-One)
            modelBuilder.Entity<Subscription>()
                .HasOne(s => s.User)
                .WithOne(u => u.Subscription)
                .HasForeignKey<Subscription>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Subscription → Payments relationship (One-to-Many)
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Subscription)
                .WithMany(s => s.Payments)
                .HasForeignKey(p => p.SubscriptionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Template)
                .WithMany()
                .HasForeignKey(i => i.TemplateId)
                .OnDelete(DeleteBehavior.SetNull);

            // User → InvoiceTemplates relationship (One-to-Many)
            modelBuilder.Entity<InvoiceTemplate>()
                .HasOne(it => it.User)
                .WithMany(u => u.InvoiceTemplates)
                .HasForeignKey(it => it.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // User → Clients relationship (One-to-Many)
            modelBuilder.Entity<Client>()
                .HasOne(c => c.User)
                .WithMany(u => u.Clients)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Client → Invoices relationship (One-to-Many)
            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.Client)
                .WithMany(c => c.Invoices)
                .HasForeignKey(i => i.ClientId)
                .OnDelete(DeleteBehavior.SetNull);

            // Client → Currency relationship (Many-to-One)
            modelBuilder.Entity<Client>()
                .HasOne(c => c.PreferredCurrency)
                .WithMany()
                .HasForeignKey(c => c.PreferredCurrencyId)
                .OnDelete(DeleteBehavior.SetNull);

            // Invoice → DocumentType relationship (Many-to-One)
            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.DocumentType)
                .WithMany(dt => dt.Invoices)
                .HasForeignKey(i => i.DocumentTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            // InvoiceTemplate → DocumentType relationship (Many-to-One, Optional)
            modelBuilder.Entity<InvoiceTemplate>()
                .HasOne(t => t.DocumentType)
                .WithMany(dt => dt.Templates)
                .HasForeignKey(t => t.DocumentTypeId)
                .OnDelete(DeleteBehavior.SetNull);

            // User → InvoiceQuotas relationship (One-to-Many)
            modelBuilder.Entity<InvoiceQuota>()
                .HasOne(iq => iq.User)
                .WithMany(u => u.InvoiceQuotas)
                .HasForeignKey(iq => iq.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique constraint on UserId + Month for InvoiceQuota
            modelBuilder.Entity<InvoiceQuota>()
                .HasIndex(iq => new { iq.UserId, iq.Month })
                .IsUnique();

            // User → SupportTickets relationship (One-to-Many)
            modelBuilder.Entity<SupportTicket>()
                .HasOne(st => st.User)
                .WithMany()
                .HasForeignKey(st => st.UserId)
                .OnDelete(DeleteBehavior.Cascade);

        }
    }
}
