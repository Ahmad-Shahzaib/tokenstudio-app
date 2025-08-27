import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom'; // Add this

interface SEOProps {
  title: string;
  description: string;
}

export default function SEO({ title, description }: SEOProps) {
  const location = useLocation(); // Get current location
  const domain = "https://solsmint.com";
  const url = `${domain}${location.pathname}`; // Use current path
  const imageUrl = `${domain}/logo.png`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="solana, token creator, crypto, blockchain, token generator, spl token, solsmint" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="TokenStudio" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@tokenstudio" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "TokenStudio",
          "description": description,
          "applicationCategory": "Blockchain",
          "operatingSystem": "All",
          "offers": {
            "@type": "Offer",
            "price": "0.8",
            "priceCurrency": "USD"
          },
          "url": domain,
          "image": imageUrl
        })}
      </script>
    </Helmet>
  );
}