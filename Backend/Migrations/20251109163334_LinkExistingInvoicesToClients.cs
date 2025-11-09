using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class LinkExistingInvoicesToClients : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Link existing invoices to clients based on matching email addresses
            // This will match invoices to clients where the BillToEmail matches the client's Email
            // and both belong to the same user
            migrationBuilder.Sql(@"
                UPDATE ""Invoices"" i
                SET ""ClientId"" = c.""Id""
                FROM ""Clients"" c
                WHERE i.""ClientId"" IS NULL
                  AND i.""IsDeleted"" = false
                  AND c.""IsDeleted"" = false
                  AND LOWER(TRIM(i.""BillToEmail"")) = LOWER(TRIM(c.""Email""))
                  AND i.""UserId"" = c.""UserId"";
            ");

            // Log how many invoices were linked (optional, for information)
            migrationBuilder.Sql(@"
                DO $$
                DECLARE
                    linked_count INTEGER;
                BEGIN
                    SELECT COUNT(*)
                    INTO linked_count
                    FROM ""Invoices""
                    WHERE ""ClientId"" IS NOT NULL
                      AND ""IsDeleted"" = false;
                    
                    RAISE NOTICE 'Successfully linked % invoices to clients', linked_count;
                END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Rollback: Remove the client links that were added by this migration
            // We'll only remove links where the email still matches to avoid breaking manually set links
            migrationBuilder.Sql(@"
                UPDATE ""Invoices"" i
                SET ""ClientId"" = NULL
                FROM ""Clients"" c
                WHERE i.""ClientId"" = c.""Id""
                  AND LOWER(TRIM(i.""BillToEmail"")) = LOWER(TRIM(c.""Email""))
                  AND i.""UserId"" = c.""UserId"";
            ");
        }
    }
}
