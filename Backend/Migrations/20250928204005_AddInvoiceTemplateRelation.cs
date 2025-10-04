using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddInvoiceTemplateRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TemplateId",
                table: "Invoices",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_TemplateId",
                table: "Invoices",
                column: "TemplateId");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_InvoiceTemplates_TemplateId",
                table: "Invoices",
                column: "TemplateId",
                principalTable: "InvoiceTemplates",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_InvoiceTemplates_TemplateId",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_TemplateId",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "TemplateId",
                table: "Invoices");
        }
    }
}
