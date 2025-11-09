using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCashInvoiceTemplateType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update the Cash Invoice template to include "type": "cash" in the TemplateData JSON
            migrationBuilder.Sql(@"
                UPDATE ""InvoiceTemplates""
                SET ""TemplateData"" = jsonb_set(
                    COALESCE(""TemplateData""::jsonb, '{}'::jsonb),
                    '{type}',
                    '""cash""'::jsonb,
                    true
                )
                WHERE ""Name"" = 'Cash Invoice' 
                AND ""IsSystemTemplate"" = true
                AND (""TemplateData""::jsonb ->> 'type' IS NULL OR ""TemplateData""::jsonb ->> 'type' != 'cash');
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Rollback: Remove the "type" field from Cash Invoice templates
            migrationBuilder.Sql(@"
                UPDATE ""InvoiceTemplates""
                SET ""TemplateData"" = (""TemplateData""::jsonb - 'type')::text
                WHERE ""Name"" = 'Cash Invoice' 
                AND ""IsSystemTemplate"" = true;
            ");
        }
    }
}
