namespace InvoicingBackend.Utils
{
    public static class EnvironmentLoader
    {
        public static void LoadEnvironmentFile(string filePath)
        {
            if (!File.Exists(filePath))
            {
                Console.WriteLine($"Environment file not found: {filePath}");
                return;
            }

            try
            {
                var lines = File.ReadAllLines(filePath);
                
                foreach (var line in lines)
                {
                    // Skip empty lines and comments
                    if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#"))
                        continue;

                    var parts = line.Split('=', 2, StringSplitOptions.RemoveEmptyEntries);
                    if (parts.Length == 2)
                    {
                        var key = parts[0].Trim();
                        var value = parts[1].Trim();
                        
                        // Remove quotes if present
                        if ((value.StartsWith("\"") && value.EndsWith("\"")) ||
                            (value.StartsWith("'") && value.EndsWith("'")))
                        {
                            value = value.Substring(1, value.Length - 2);
                        }

                        // Only set if not already set (allows override via actual environment variables)
                        if (Environment.GetEnvironmentVariable(key) == null)
                        {
                            Environment.SetEnvironmentVariable(key, value);
                        }
                    }
                }

                Console.WriteLine($"Successfully loaded environment file: {filePath}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading environment file {filePath}: {ex.Message}");
            }
        }

        public static void LoadEnvironmentFiles(IWebHostEnvironment environment)
        {
            var rootPath = Directory.GetParent(environment.ContentRootPath)?.FullName;
            if (rootPath == null) return;

            // Load the appropriate .env file based on environment
            var envFile = environment.IsDevelopment() 
                ? Path.Combine(rootPath, ".env.development")
                : Path.Combine(rootPath, ".env.production");

            LoadEnvironmentFile(envFile);

            // Also try to load a generic .env file if it exists
            var genericEnvFile = Path.Combine(rootPath, ".env");
            if (File.Exists(genericEnvFile))
            {
                LoadEnvironmentFile(genericEnvFile);
            }
        }
    }
}
