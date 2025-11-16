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
                        "--disable-gpu",
                        "--disable-software-rasterizer",
                        "--disable-extensions"
                    }
                };

                await using var browser = await Puppeteer.LaunchAsync(launchOptions);
                await using var page = await browser.NewPageAsync();

                _logger.LogInformation("Loading invoice HTML content...");
                
                // Load HTML content
                await page.SetContentAsync(htmlContent, new NavigationOptions
                {
                    WaitUntil = new[] { WaitUntilNavigation.Networkidle0 }
                });

                // Wait for content to fully render
                await Task.Delay(2000);

                _logger.LogInformation("Generating PDF...");

                // Generate PDF with proper options for multi-page support
                var pdfOptions = new PdfOptions
                {
                    Format = PaperFormat.A4,
                    PrintBackground = true,
                    PreferCSSPageSize = true,
                    DisplayHeaderFooter = false,
                    OmitBackground = false
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
