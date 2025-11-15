using PuppeteerSharp;
using PuppeteerSharp.Media;
using InvoicingBackend.Models;
using System.Text;

namespace InvoicingBackend.Services
{
    public interface IPdfGenerationService
    {
        Task<byte[]> GenerateInvoicePdfAsync(string htmlContent);
        Task EnsureBrowserInstalledAsync();
    }

    public class PdfGenerationService : IPdfGenerationService
    {
        private readonly ILogger<PdfGenerationService> _logger;
        private static bool _browserDownloaded = false;
        private static readonly SemaphoreSlim _browserDownloadLock = new(1, 1);

        public PdfGenerationService(ILogger<PdfGenerationService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Ensures Chromium browser is downloaded for Puppeteer
        /// </summary>
        public async Task EnsureBrowserInstalledAsync()
        {
            if (_browserDownloaded) return;

            await _browserDownloadLock.WaitAsync();
            try
            {
                if (_browserDownloaded) return;

                _logger.LogInformation("Checking for Chromium browser...");
                
                var browserFetcher = new BrowserFetcher();
                var installedBrowser = browserFetcher.GetInstalledBrowsers().FirstOrDefault();

                if (installedBrowser == null)
                {
                    _logger.LogInformation("Downloading Chromium browser for PDF generation...");
                    await browserFetcher.DownloadAsync();
                    _logger.LogInformation("Chromium browser downloaded successfully");
                }
                else
                {
                    _logger.LogInformation($"Chromium browser already installed");
                }

                _browserDownloaded = true;
            }
            finally
            {
                _browserDownloadLock.Release();
            }
        }

        /// <summary>
        /// Generates a PDF from HTML content with selectable text
        /// </summary>
        public async Task<byte[]> GenerateInvoicePdfAsync(string htmlContent)
        {
            try
            {
                // Ensure browser is installed
                await EnsureBrowserInstalledAsync();

                _logger.LogInformation("Launching headless browser for PDF generation...");

                // Launch browser
                var launchOptions = new LaunchOptions
                {
                    Headless = true,
                    Args = new[]
                    {
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-dev-shm-usage",
                        "--disable-gpu"
                    }
                };

                await using var browser = await Puppeteer.LaunchAsync(launchOptions);
                await using var page = await browser.NewPageAsync();

                // Set viewport for consistent rendering
                await page.SetViewportAsync(new ViewPortOptions
                {
                    Width = 800,
                    Height = 1200
                });

                _logger.LogInformation("Loading invoice HTML content...");
                
                // Load HTML content
                await page.SetContentAsync(htmlContent, new NavigationOptions
                {
                    WaitUntil = new[] { WaitUntilNavigation.Networkidle0 }
                });

                // Wait a bit for any dynamic content to render
                await Task.Delay(500);

                _logger.LogInformation("Generating PDF...");

                // Generate PDF with proper options
                var pdfOptions = new PdfOptions
                {
                    Format = PaperFormat.A4,
                    PrintBackground = true,
                    MarginOptions = new MarginOptions
                    {
                        Top = "0.5in",
                        Bottom = "0.5in",
                        Left = "0.5in",
                        Right = "0.5in"
                    },
                    PreferCSSPageSize = false,
                    DisplayHeaderFooter = false
                };

                var pdfBytes = await page.PdfDataAsync(pdfOptions);

                _logger.LogInformation($"PDF generated successfully. Size: {pdfBytes.Length / 1024} KB");

                return pdfBytes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate PDF");
                throw new Exception($"PDF generation failed: {ex.Message}", ex);
            }
        }
    }
}
