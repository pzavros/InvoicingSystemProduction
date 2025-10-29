using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;

namespace InvoicingBackend.Services
{
    public class EmailTemplateService
    {
        private readonly string _templateBasePath;
        private string? _baseTemplate;

        public EmailTemplateService()
        {
            // Get the directory where the Backend.dll is located
            var assemblyLocation = Assembly.GetExecutingAssembly().Location;
            var assemblyDirectory = Path.GetDirectoryName(assemblyLocation) ?? string.Empty;
            _templateBasePath = Path.Combine(assemblyDirectory, "EmailTemplates");
        }

        private string GetBaseTemplate()
        {
            if (_baseTemplate != null)
                return _baseTemplate;

            var baseTemplatePath = Path.Combine(_templateBasePath, "_BaseTemplate.html");
            if (!File.Exists(baseTemplatePath))
                throw new FileNotFoundException($"Base template not found at {baseTemplatePath}");

            _baseTemplate = File.ReadAllText(baseTemplatePath);
            return _baseTemplate;
        }

        private string GetTemplateContent(string templateName)
        {
            var templatePath = Path.Combine(_templateBasePath, $"{templateName}.html");
            if (!File.Exists(templatePath))
                throw new FileNotFoundException($"Template not found: {templateName}");

            return File.ReadAllText(templatePath);
        }

        public string RenderTemplate(string templateName, Dictionary<string, string> placeholders)
        {
            var baseTemplate = GetBaseTemplate();
            var bodyContent = GetTemplateContent(templateName);

            // Replace placeholders in body content
            foreach (var placeholder in placeholders)
            {
                bodyContent = bodyContent.Replace($"{{{{{placeholder.Key}}}}}", placeholder.Value);
            }

            // Build the complete email
            var completeEmail = baseTemplate;
            completeEmail = completeEmail.Replace("{{BODY_CONTENT}}", bodyContent);

            // Replace remaining base template placeholders
            foreach (var placeholder in placeholders)
            {
                completeEmail = completeEmail.Replace($"{{{{{placeholder.Key}}}}}", placeholder.Value);
            }

            // Set defaults for base template if not provided
            if (!placeholders.ContainsKey("TITLE"))
                completeEmail = completeEmail.Replace("{{TITLE}}", placeholders.GetValueOrDefault("HEADER_TITLE", "E-nvoicing"));

            if (!placeholders.ContainsKey("HEADER_SUBTITLE"))
                completeEmail = completeEmail.Replace("{{HEADER_SUBTITLE}}", string.Empty);

            if (!placeholders.ContainsKey("COMPANY_WEBSITE"))
                completeEmail = completeEmail.Replace("{{COMPANY_WEBSITE}}", string.Empty);

            return completeEmail;
        }

        // Helper methods for common email types

        public string RenderSendInvoiceEmail(
            string clientName,
            string invoiceNumber,
            string documentType,
            string issueDate,
            string dueDate,
            string totalAmount,
            string senderName,
            string? paymentInfo = null,
            string companyName = "E-nvoicing",
            string companyEmail = "support@e-nvoicing.com",
            string? companyWebsite = null)
        {
            var placeholders = new Dictionary<string, string>
            {
                { "HEADER_TITLE", $"Invoice {invoiceNumber}" },
                { "HEADER_SUBTITLE", $"<p>{documentType} from {senderName}</p>" },
                { "CLIENT_NAME", clientName },
                { "INVOICE_NUMBER", invoiceNumber },
                { "DOCUMENT_TYPE", documentType },
                { "ISSUE_DATE", issueDate },
                { "DUE_DATE", dueDate },
                { "TOTAL_AMOUNT", totalAmount },
                { "SENDER_NAME", senderName },
                { "PAYMENT_INFO", paymentInfo ?? string.Empty },
                { "COMPANY_NAME", companyName },
                { "COMPANY_EMAIL", companyEmail },
                { "COMPANY_WEBSITE", !string.IsNullOrEmpty(companyWebsite) ? $"<p>{companyWebsite}</p>" : string.Empty }
            };

            return RenderTemplate("SendInvoice", placeholders);
        }

        public string RenderInvoicePaymentReminderEmail(
            string clientName,
            string invoiceNumber,
            string issueDate,
            string dueDate,
            string totalAmount,
            string senderName,
            string dueStatus,
            string? paymentInfo = null,
            string companyName = "E-nvoicing",
            string companyEmail = "support@e-nvoicing.com")
        {
            var placeholders = new Dictionary<string, string>
            {
                { "HEADER_TITLE", "Payment Reminder" },
                { "HEADER_SUBTITLE", $"<p>Invoice {invoiceNumber}</p>" },
                { "CLIENT_NAME", clientName },
                { "INVOICE_NUMBER", invoiceNumber },
                { "ISSUE_DATE", issueDate },
                { "DUE_DATE", dueDate },
                { "DUE_STATUS", dueStatus },
                { "TOTAL_AMOUNT", totalAmount },
                { "SENDER_NAME", senderName },
                { "PAYMENT_INFO", paymentInfo ?? string.Empty },
                { "COMPANY_NAME", companyName },
                { "COMPANY_EMAIL", companyEmail },
                { "COMPANY_WEBSITE", string.Empty }
            };

            return RenderTemplate("InvoicePaymentReminder", placeholders);
        }

        public string RenderInvoicePaidConfirmationEmail(
            string clientName,
            string invoiceNumber,
            string paymentDate,
            string totalAmount,
            string senderName,
            string companyName = "E-nvoicing",
            string companyEmail = "support@e-nvoicing.com")
        {
            var placeholders = new Dictionary<string, string>
            {
                { "HEADER_TITLE", "Payment Confirmed" },
                { "HEADER_SUBTITLE", "<p>Thank you for your payment!</p>" },
                { "CLIENT_NAME", clientName },
                { "INVOICE_NUMBER", invoiceNumber },
                { "PAYMENT_DATE", paymentDate },
                { "TOTAL_AMOUNT", totalAmount },
                { "SENDER_NAME", senderName },
                { "COMPANY_NAME", companyName },
                { "COMPANY_EMAIL", companyEmail },
                { "COMPANY_WEBSITE", string.Empty }
            };

            return RenderTemplate("InvoicePaidConfirmation", placeholders);
        }

        public string RenderWelcomeEmail(
            string userName,
            string loginUrl,
            string companyName = "E-nvoicing",
            string companyEmail = "support@e-nvoicing.com")
        {
            var placeholders = new Dictionary<string, string>
            {
                { "HEADER_TITLE", "Welcome to E-nvoicing!" },
                { "HEADER_SUBTITLE", "<p>Your account has been created successfully</p>" },
                { "USER_NAME", userName },
                { "LOGIN_URL", loginUrl },
                { "COMPANY_NAME", companyName },
                { "COMPANY_EMAIL", companyEmail },
                { "COMPANY_WEBSITE", string.Empty }
            };

            return RenderTemplate("WelcomeEmail", placeholders);
        }

        public string RenderPasswordResetEmail(
            string userName,
            string resetToken,
            string companyName = "E-nvoicing",
            string companyEmail = "support@e-nvoicing.com")
        {
            var placeholders = new Dictionary<string, string>
            {
                { "HEADER_TITLE", "Password Reset Request" },
                { "HEADER_SUBTITLE", "<p>Reset your account password</p>" },
                { "USER_NAME", userName },
                { "RESET_TOKEN", resetToken },
                { "COMPANY_NAME", companyName },
                { "COMPANY_EMAIL", companyEmail },
                { "COMPANY_WEBSITE", string.Empty }
            };

            return RenderTemplate("PasswordReset", placeholders);
        }

        public string RenderPasswordChangeOtpEmail(
            string userName,
            string otpCode,
            string companyName = "E-nvoicing",
            string companyEmail = "support@e-nvoicing.com")
        {
            var placeholders = new Dictionary<string, string>
            {
                { "HEADER_TITLE", "Verify Password Change" },
                { "HEADER_SUBTITLE", "<p>Your verification code</p>" },
                { "USER_NAME", userName },
                { "OTP_CODE", otpCode },
                { "COMPANY_NAME", companyName },
                { "COMPANY_EMAIL", companyEmail },
                { "COMPANY_WEBSITE", string.Empty }
            };

            return RenderTemplate("PasswordChangeOTP", placeholders);
        }

        public string RenderAccountVerificationEmail(
            string userName,
            string verificationCode,
            string verificationUrl,
            string companyName = "E-nvoicing",
            string companyEmail = "support@e-nvoicing.com")
        {
            var placeholders = new Dictionary<string, string>
            {
                { "HEADER_TITLE", "Verify Your Email" },
                { "HEADER_SUBTITLE", "<p>One last step to complete your registration</p>" },
                { "USER_NAME", userName },
                { "VERIFICATION_CODE", verificationCode },
                { "VERIFICATION_URL", verificationUrl },
                { "COMPANY_NAME", companyName },
                { "COMPANY_EMAIL", companyEmail },
                { "COMPANY_WEBSITE", string.Empty }
            };

            return RenderTemplate("AccountVerification", placeholders);
        }

        public string RenderContactFormSubmissionEmail(
            string userName,
            string userEmail,
            string message,
            string referenceId,
            string submissionDate,
            string companyName = "E-nvoicing",
            string companyEmail = "support@e-nvoicing.com")
        {
            var placeholders = new Dictionary<string, string>
            {
                { "HEADER_TITLE", "Message Received" },
                { "HEADER_SUBTITLE", "<p>We'll get back to you soon!</p>" },
                { "USER_NAME", userName },
                { "USER_EMAIL", userEmail },
                { "MESSAGE", message },
                { "REFERENCE_ID", referenceId },
                { "SUBMISSION_DATE", submissionDate },
                { "COMPANY_NAME", companyName },
                { "COMPANY_EMAIL", companyEmail },
                { "COMPANY_WEBSITE", string.Empty }
            };

            return RenderTemplate("ContactFormSubmission", placeholders);
        }

        public string RenderAdminContactNotificationEmail(
            string userName,
            string userEmail,
            string subject,
            string message,
            string referenceId,
            string submissionDate,
            string? userInfo = null,
            string companyName = "E-nvoicing",
            string companyEmail = "support@e-nvoicing.com")
        {
            var placeholders = new Dictionary<string, string>
            {
                { "HEADER_TITLE", "New Contact Submission" },
                { "HEADER_SUBTITLE", "<p>Action required</p>" },
                { "USER_NAME", userName },
                { "USER_EMAIL", userEmail },
                { "SUBJECT", subject },
                { "MESSAGE", message },
                { "REFERENCE_ID", referenceId },
                { "SUBMISSION_DATE", submissionDate },
                { "USER_INFO", userInfo ?? string.Empty },
                { "COMPANY_NAME", companyName },
                { "COMPANY_EMAIL", companyEmail },
                { "COMPANY_WEBSITE", string.Empty }
            };

            return RenderTemplate("AdminContactNotification", placeholders);
        }

        public string RenderSupportTicketCreatedEmail(
            string userName,
            string ticketId,
            string priority,
            string createdDate,
            string issueDescription,
            string companyName = "E-nvoicing",
            string companyEmail = "support@e-nvoicing.com")
        {
            var placeholders = new Dictionary<string, string>
            {
                { "HEADER_TITLE", "Support Ticket Created" },
                { "HEADER_SUBTITLE", $"<p>Ticket #{ticketId}</p>" },
                { "USER_NAME", userName },
                { "TICKET_ID", ticketId },
                { "PRIORITY", priority },
                { "CREATED_DATE", createdDate },
                { "ISSUE_DESCRIPTION", issueDescription },
                { "COMPANY_NAME", companyName },
                { "COMPANY_EMAIL", companyEmail },
                { "COMPANY_WEBSITE", string.Empty }
            };

            return RenderTemplate("SupportTicketCreated", placeholders);
        }

        public string RenderTrialStartedEmail(
            string userName,
            string trialStartDate,
            string trialEndDate,
            string trialDuration,
            string dashboardUrl,
            string companyName = "E-nvoicing",
            string companyEmail = "support@e-nvoicing.com")
        {
            var placeholders = new Dictionary<string, string>
            {
                { "HEADER_TITLE", "Your Free Trial Has Started!" },
                { "HEADER_SUBTITLE", "<p>Enjoy full access to all premium features</p>" },
                { "USER_NAME", userName },
                { "TRIAL_START_DATE", trialStartDate },
                { "TRIAL_END_DATE", trialEndDate },
                { "TRIAL_DURATION", trialDuration },
                { "DASHBOARD_URL", dashboardUrl },
                { "COMPANY_NAME", companyName },
                { "COMPANY_EMAIL", companyEmail },
                { "COMPANY_WEBSITE", string.Empty }
            };

            return RenderTemplate("TrialStarted", placeholders);
        }

        public string RenderSubscriptionCancelledEmail(
            string userName,
            string cancellationDate,
            string accessEndDate,
            string planName,
            string freeInvoiceLimit,
            string feedbackUrl,
            string companyName = "E-nvoicing",
            string companyEmail = "support@e-nvoicing.com")
        {
            var placeholders = new Dictionary<string, string>
            {
                { "HEADER_TITLE", "Subscription Cancelled" },
                { "HEADER_SUBTITLE", "<p>We're sorry to see you go</p>" },
                { "USER_NAME", userName },
                { "CANCELLATION_DATE", cancellationDate },
                { "ACCESS_END_DATE", accessEndDate },
                { "PLAN_NAME", planName },
                { "FREE_INVOICE_LIMIT", freeInvoiceLimit },
                { "FEEDBACK_URL", feedbackUrl },
                { "COMPANY_NAME", companyName },
                { "COMPANY_EMAIL", companyEmail },
                { "COMPANY_WEBSITE", string.Empty }
            };

            return RenderTemplate("SubscriptionCancelled", placeholders);
        }

        public string RenderPremiumUpgradeEmail(
            string userName,
            string startDate,
            string nextBillingDate,
            string monthlyPrice,
            string dashboardUrl,
            string companyName = "E-nvoicing",
            string companyEmail = "support@e-nvoicing.com")
        {
            var placeholders = new Dictionary<string, string>
            {
                { "HEADER_TITLE", "Welcome to Premium" },
                { "HEADER_SUBTITLE", "<p>Thank you for upgrading!</p>" },
                { "USER_NAME", userName },
                { "START_DATE", startDate },
                { "NEXT_BILLING_DATE", nextBillingDate },
                { "MONTHLY_PRICE", monthlyPrice },
                { "DASHBOARD_URL", dashboardUrl },
                { "COMPANY_NAME", companyName },
                { "COMPANY_EMAIL", companyEmail },
                { "COMPANY_WEBSITE", string.Empty }
            };

            return RenderTemplate("PremiumUpgrade", placeholders);
        }
    }
}
