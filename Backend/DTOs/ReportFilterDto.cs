using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;

namespace InvoicingBackend.DTOs
{
    public class ReportFilterDto
    {
        [FromQuery(Name = "from")]
        public DateTime From { get; set; }

        [FromQuery(Name = "to")]
        public DateTime To { get; set; }

        // binds both ?statusIds=3&statusIds=4 and ?statusIds=3,4
        [FromQuery(Name = "statusIds")]
        public List<int> StatusIds { get; set; } = new List<int> { 1,2,3, 4 };

        // Column selection for the report - binds both ?columns=invoiceNumber&columns=date and ?columns=invoiceNumber,date
        [FromQuery(Name = "columns")]
        public List<string> SelectedColumns { get; set; } = new List<string> 
        { 
            "invoiceNumber", "date", "customer", "itemTitle", "status", "vatAmount", "discountAmount", "totalAmount" 
        };
    }

    public static class ReportColumns
    {
        public const string InvoiceNumber = "invoiceNumber";
        public const string Date = "date";
        public const string Customer = "customer";
        public const string ItemTitle = "itemTitle";
        public const string Status = "status";
        public const string VatAmount = "vatAmount";
        public const string DiscountAmount = "discountAmount";
        public const string TotalAmount = "totalAmount";
        public const string ItemDescription = "itemDescription";
        public const string Quantity = "quantity";
        public const string UnitPrice = "unitPrice";
        public const string Subtotal = "subtotal";
        public const string InvoiceNotes = "invoiceNotes";
        public const string DueDate = "dueDate";
        public const string BillToEmail = "billToEmail";
        public const string BillToAddress = "billToAddress";

        public static readonly Dictionary<string, string> ColumnHeaders = new()
        {
            { InvoiceNumber, "Invoice #" },
            { Date, "Date" },
            { Customer, "Customer" },
            { ItemTitle, "Item Title" },
            { Status, "Status" },
            { VatAmount, "VAT Amount" },
            { DiscountAmount, "Discount Amount" },
            { TotalAmount, "Total Amount (EUR)" },
            { ItemDescription, "Item Description" },
            { Quantity, "Quantity" },
            { UnitPrice, "Unit Price" },
            { Subtotal, "Subtotal" },
            { InvoiceNotes, "Notes" },
            { DueDate, "Due Date" },
            { BillToEmail, "Customer Email" },
            { BillToAddress, "Customer Address" }
        };
    }
}