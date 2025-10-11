namespace InvoicingBackend.DTOs
{
    public class EmailDto
    {
        public string To { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public bool IsHtml { get; set; } = true;
        public List<string>? Cc { get; set; }
        public List<string>? Bcc { get; set; }
        public List<EmailAttachmentDto>? Attachments { get; set; }
    }

    public class EmailAttachmentDto
    {
        public string FileName { get; set; } = string.Empty;
        public byte[] Content { get; set; } = Array.Empty<byte>();
        public string ContentType { get; set; } = "application/octet-stream";
    }

    public class EmailResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
