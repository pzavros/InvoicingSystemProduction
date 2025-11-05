import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = "Professional Invoicing System | Global E-Invoicing Solution",
  description = "Advanced cloud-based invoicing and logistics reporting system for businesses worldwide. Professional e-invoicing, invoice management, digital invoicing software with Stripe integration. Streamline your billing process globally.",
  keywords = "invoicing system, e-invoicing, electronic invoicing, invoice software, online invoicing, digital invoicing, invoice management, cloud invoicing, logistics invoicing, professional invoicing, invoice generator, billing software, Stripe invoicing, invoice templates, business invoicing, invoice tracking, automated invoicing, international invoicing, multi-currency invoicing, global invoicing solution",
  ogImage = "/media/og-image.jpg",
  ogType = "website",
  canonicalUrl,
  structuredData,
  geoRegion = null, // Optional: specify region like "US", "GB", "CY" for local targeting
  geoPlacename = null // Optional: specify place like "New York", "London", "Cyprus"
}) => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com';
  const url = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : siteUrl);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:site_name" content="Professional Invoicing System" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${siteUrl}${ogImage}`} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Professional Invoicing System" />
      
      {/* Geo Tags - Only include if specified for local targeting */}
      {geoRegion && <meta name="geo.region" content={geoRegion} />}
      {geoPlacename && <meta name="geo.placename" content={geoPlacename} />}

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
