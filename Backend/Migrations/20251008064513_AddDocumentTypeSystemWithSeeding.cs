using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentTypeSystemWithSeeding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // First create the DocumentTypes table
            migrationBuilder.CreateTable(
                name: "DocumentTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    NumberPrefix = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    DisplayName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    RequiresTaxInfo = table.Column<bool>(type: "boolean", nullable: false),
                    IsQuotation = table.Column<bool>(type: "boolean", nullable: false),
                    IsProforma = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: true),
                    DateEntered = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EnteredBy = table.Column<string>(type: "text", nullable: true),
                    DateModified = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DateDeleted = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "bytea", rowVersion: true, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentTypes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentTypes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTypes_UserId",
                table: "DocumentTypes",
                column: "UserId");

            // Seed the document types
            var now = DateTime.UtcNow;
            migrationBuilder.InsertData(
                table: "DocumentTypes",
                columns: new[] { "Id", "Name", "Description", "Code", "NumberPrefix", "DisplayName", "RequiresTaxInfo", "IsQuotation", "IsProforma", "IsActive", "DateEntered", "IsDeleted" },
                values: new object[,]
                {
                    { 1, "Invoice", "Standard invoice for completed sales", "INV", "INV", "Invoice", true, false, false, true, now, false },
                    { 2, "Tax Invoice", "Invoice with detailed tax information", "TAX", "TAX", "Tax Invoice", true, false, false, true, now, false },
                    { 3, "Proforma", "Proforma invoice for advance payment or customs", "PRO", "PRO", "Proforma Invoice", false, false, true, true, now, false },
                    { 4, "Quotation", "Price quotation for potential customers", "QUO", "QUO", "Quotation", false, true, false, true, now, false }
                });

            // Now add the columns with proper default values
            migrationBuilder.AddColumn<int>(
                name: "DocumentTypeId",
                table: "InvoiceTemplates",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DocumentTypeId",
                table: "Invoices",
                type: "integer",
                nullable: false,
                defaultValue: 1); // Default to Invoice type

            // Update any existing invoices to use Invoice type (Id = 1)
            migrationBuilder.Sql("UPDATE \"Invoices\" SET \"DocumentTypeId\" = 1 WHERE \"DocumentTypeId\" = 0 OR \"DocumentTypeId\" IS NULL;");

            // Create indexes
            migrationBuilder.CreateIndex(
                name: "IX_InvoiceTemplates_DocumentTypeId",
                table: "InvoiceTemplates",
                column: "DocumentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_DocumentTypeId",
                table: "Invoices",
                column: "DocumentTypeId");

            // Finally add the foreign key constraints
            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_DocumentTypes_DocumentTypeId",
                table: "Invoices",
                column: "DocumentTypeId",
                principalTable: "DocumentTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InvoiceTemplates_DocumentTypes_DocumentTypeId",
                table: "InvoiceTemplates",
                column: "DocumentTypeId",
                principalTable: "DocumentTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_DocumentTypes_DocumentTypeId",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_InvoiceTemplates_DocumentTypes_DocumentTypeId",
                table: "InvoiceTemplates");

            migrationBuilder.DropTable(
                name: "DocumentTypes");

            migrationBuilder.DropIndex(
                name: "IX_InvoiceTemplates_DocumentTypeId",
                table: "InvoiceTemplates");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_DocumentTypeId",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "DocumentTypeId",
                table: "InvoiceTemplates");

            migrationBuilder.DropColumn(
                name: "DocumentTypeId",
                table: "Invoices");
        }
    }
}
