using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class EnsureOverdueStatusExists : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Ensure Overdue status exists (StatusId = 5)
            // Using raw SQL to handle the case where it might already exist
            migrationBuilder.Sql(@"
                INSERT INTO ""Statuses"" (""StatusId"", ""Name"")
                VALUES (5, 'Overdue')
                ON CONFLICT (""StatusId"") DO NOTHING;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove Overdue status
            migrationBuilder.Sql(@"
                DELETE FROM ""Statuses"" WHERE ""StatusId"" = 5;
            ");
        }
    }
}
