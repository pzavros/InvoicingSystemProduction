using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentTypeCategoryAndLogistics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "DocumentTypes",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Invoice");

            migrationBuilder.AddColumn<bool>(
                name: "CountsForLogistics",
                table: "DocumentTypes",
                type: "boolean",
                nullable: false,
                defaultValue: true);
            
            // Update existing records based on their type
            // Invoice (ID=1) -> Category: Invoice, CountsForLogistics: true
            migrationBuilder.Sql(@"
                UPDATE ""DocumentTypes"" 
                SET ""Category"" = 'Invoice', ""CountsForLogistics"" = true 
                WHERE ""Id"" = 1;
            ");
            
            // Tax Invoice (ID=2) -> Category: Invoice, CountsForLogistics: true
            migrationBuilder.Sql(@"
                UPDATE ""DocumentTypes"" 
                SET ""Category"" = 'Invoice', ""CountsForLogistics"" = true 
                WHERE ""Id"" = 2;
            ");
            
            // Proforma Invoice (ID=3) -> Category: Proforma, CountsForLogistics: false
            migrationBuilder.Sql(@"
                UPDATE ""DocumentTypes"" 
                SET ""Category"" = 'Proforma', ""CountsForLogistics"" = false 
                WHERE ""Id"" = 3;
            ");
            
            // Quotation (ID=4) -> Category: Proforma, CountsForLogistics: false
            migrationBuilder.Sql(@"
                UPDATE ""DocumentTypes"" 
                SET ""Category"" = 'Proforma', ""CountsForLogistics"" = false 
                WHERE ""Id"" = 4;
            ");
            
            // Add Cash Invoice if it doesn't exist (using the same UserId as existing document types)
            migrationBuilder.Sql(@"
                INSERT INTO ""DocumentTypes"" (""Name"", ""Description"", ""Code"", ""NumberPrefix"", ""DisplayName"", ""Category"", ""CountsForLogistics"", ""RequiresTaxInfo"", ""IsQuotation"", ""IsProforma"", ""IsActive"", ""DateEntered"", ""EnteredBy"", ""UserId"", ""IsDeleted"")
                SELECT 'Cash Invoice', 'Invoice for immediate cash payment', 'CASH', 'CASH-', 'Cash Invoice', 'Invoice', true, false, false, false, true, NOW(), 'System', (SELECT ""UserId"" FROM ""DocumentTypes"" LIMIT 1), false
                WHERE NOT EXISTS (SELECT 1 FROM ""DocumentTypes"" WHERE ""Code"" = 'CASH');
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "DocumentTypes");

            migrationBuilder.DropColumn(
                name: "CountsForLogistics",
                table: "DocumentTypes");
        }
    }
}
