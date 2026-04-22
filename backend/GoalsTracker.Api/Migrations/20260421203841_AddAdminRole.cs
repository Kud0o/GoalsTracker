using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GoalsTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AssignedByAdminId",
                table: "Goals",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Goals_AssignedByAdminId",
                table: "Goals",
                column: "AssignedByAdminId");

            migrationBuilder.AddForeignKey(
                name: "FK_Goals_AspNetUsers_AssignedByAdminId",
                table: "Goals",
                column: "AssignedByAdminId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Goals_AspNetUsers_AssignedByAdminId",
                table: "Goals");

            migrationBuilder.DropIndex(
                name: "IX_Goals_AssignedByAdminId",
                table: "Goals");

            migrationBuilder.DropColumn(
                name: "AssignedByAdminId",
                table: "Goals");
        }
    }
}
