using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddContactMessages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContactMessages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FirstName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    Subject = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: false),
                    IsRead = table.Column<bool>(type: "INTEGER", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsReplied = table.Column<bool>(type: "INTEGER", nullable: false),
                    RepliedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AdminNotes = table.Column<string>(type: "TEXT", nullable: true),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    Source = table.Column<string>(type: "TEXT", nullable: true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: true),
                    DateEntered = table.Column<DateTime>(type: "TEXT", nullable: false),
                    EnteredBy = table.Column<string>(type: "TEXT", nullable: true),
                    DateModified = table.Column<DateTime>(type: "TEXT", nullable: true),
                    ModifiedBy = table.Column<string>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false),
                    DateDeleted = table.Column<DateTime>(type: "TEXT", nullable: true),
                    DeletedBy = table.Column<string>(type: "TEXT", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "BLOB", rowVersion: true, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContactMessages_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ContactMessages_UserId",
                table: "ContactMessages",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContactMessages");
        }
    }
}
