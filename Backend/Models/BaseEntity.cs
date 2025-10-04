// Models/BaseEntity.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace InvoicingBackend.Models
{
    public abstract class BaseEntity
    {
        [Key]
        public int Id { get; set; }

        // Multi-tenancy support - every entity belongs to a user
        public int? UserId { get; set; }
        public User? User { get; set; }

        // Audit trail fields
        public DateTime DateEntered { get; set; } = DateTime.UtcNow;
        public string? EnteredBy { get; set; }
        
        public DateTime? DateModified { get; set; }
        public string? ModifiedBy { get; set; }

        // Soft delete functionality
        public bool IsDeleted { get; set; } = false;
        public DateTime? DateDeleted { get; set; }
        public string? DeletedBy { get; set; }

        // Optional: Version control for optimistic concurrency
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        // Helper method to mark entity as deleted
        public void SoftDelete(string deletedBy)
        {
            IsDeleted = true;
            DateDeleted = DateTime.UtcNow;
            DeletedBy = deletedBy;
        }

        // Helper method to update modification tracking
        public void MarkAsModified(string modifiedBy)
        {
            DateModified = DateTime.UtcNow;
            ModifiedBy = modifiedBy;
        }
    }
}