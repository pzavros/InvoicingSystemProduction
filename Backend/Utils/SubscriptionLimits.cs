namespace InvoicingBackend.Utils
{
    public static class SubscriptionLimits
    {
        public const string FREE_TIER = "free";
        public const string PREMIUM_TIER = "premium";
        
        public static class Free
        {
            public const int MaxClients = 1;
            public const int MaxCategories = 1;
            public const int MaxProducts = 1;
            public const int MaxInvoicesPerMonth = 3;
            public const int MaxTemplates = 0;
        }
        
        public static class Premium
        {
            public const int MaxClients = int.MaxValue;
            public const int MaxCategories = int.MaxValue;
            public const int MaxProducts = int.MaxValue;
            public const int MaxInvoicesPerMonth = int.MaxValue;
            public const int MaxTemplates = int.MaxValue;
        }
        
        public static class Watermark
        {
            public const string Text = "CREATED WITH FREE TIER";
            public const float Opacity = 0.1f;
            public const int FontSize = 48;
            public const int Rotation = 45;
        }
    }
}
