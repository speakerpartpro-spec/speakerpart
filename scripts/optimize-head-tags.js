const fs = require('fs');
const path = require('path');

const ROOT_DIR = 'C:/Users/Hp/.gemini/antigravity/scratch/thespeakerpartsco';
const DOMAIN = 'https://speakerpartpro.vercel.app';

// 1. Remove @import from styles/globals.css
const cssPath = path.join(ROOT_DIR, 'styles', 'globals.css');
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf8');
  css = css.replace(/@import\s+url\(['"]https:\/\/fonts\.googleapis\.com\/css2\?[^'"]+['"]\);?\s*/g, '');
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Removed render-blocking @import from styles/globals.css');
}

// 2. Metadata definitions for static pages
const pageConfigs = {
  'index.html': {
    title: 'SPEAKERPARTPRO | Wholesale Speaker Parts & OEM Transducers',
    description: 'Premier B2B manufacturer and global exporter of voice coils, speaker cones, foam & rubber surrounds, Nomex spiders, and recone kits from Jaipur, India.',
    canonical: `${DOMAIN}/`,
    ogType: 'website',
    ogImage: `${DOMAIN}/assets/speakerpartpro-hero-banner.png`,
    hasOrgSchema: true
  },
  'about.html': {
    title: 'Corporate Profile & Heritage | SPEAKERPARTPRO',
    description: 'Learn about SPEAKERPARTPRO: Jaipur-based electro-acoustic manufacturer, ISO 9001:2015 certified, 25-year loudspeaker component engineering heritage.',
    canonical: `${DOMAIN}/about.html`,
    ogType: 'website',
    ogImage: `${DOMAIN}/assets/spp-factory-cnc.jpg`,
    hasOrgSchema: true
  },
  'products.html': {
    title: 'B2B Wholesale Products Catalog | SPEAKERPARTPRO',
    description: 'Explore the complete B2B catalog of precision loudspeaker components — voice coils, paper cones, foam & rubber surrounds, spiders, and recone kits.',
    canonical: `${DOMAIN}/products.html`,
    ogType: 'website',
    ogImage: `${DOMAIN}/assets/speakerpartpro-hero-banner.png`
  },
  'process.html': {
    title: 'OEM Manufacturing Process | SPEAKERPARTPRO',
    description: 'Step-by-step SPEAKERPARTPRO OEM manufacturing: CNC voice coil winding, pulp cone molding, foam thermoforming, and acoustic testing from Jaipur, India.',
    canonical: `${DOMAIN}/process.html`,
    ogType: 'website',
    ogImage: `${DOMAIN}/assets/spp-factory-qc.jpg`
  },
  'export.html': {
    title: 'Global B2B Export & Logistics | SPEAKERPARTPRO',
    description: 'Worldwide air courier and ocean container export documentation, Incoterms (FOB/CIF/DDP), and shipping tiers for loudspeaker parts (HS Code 8518.90.00).',
    canonical: `${DOMAIN}/export.html`,
    ogType: 'website',
    ogImage: `${DOMAIN}/assets/speakerpartpro-hero-banner.png`
  },
  'contact.html': {
    title: 'Contact Us & B2B Inquiry Desk | SPEAKERPARTPRO',
    description: 'Direct factory B2B inquiry desk, wholesale quotation requests, WhatsApp sales support (+91 92521 92491), and Jaipur factory location for SPEAKERPARTPRO.',
    canonical: `${DOMAIN}/contact.html`,
    ogType: 'website',
    ogImage: `${DOMAIN}/assets/speakerpartpro-hero-banner.png`
  },
  'gallery.html': {
    title: 'Product Gallery & Visual Showcase | SPEAKERPARTPRO',
    description: 'High-resolution visual showcase of precision voice coils, cones, surrounds, spiders, and acoustic driver assemblies from SPEAKERPARTPRO.',
    canonical: `${DOMAIN}/gallery.html`,
    ogType: 'website',
    ogImage: `${DOMAIN}/assets/speakerpartpro-hero-banner.png`
  },
  'blog.html': {
    title: 'Knowledge Hub & Engineering Guides | SPEAKERPARTPRO',
    description: 'Technical engineering guides, material selection comparisons, voice coil manufacturing insights, and reconing tutorials from SPEAKERPARTPRO.',
    canonical: `${DOMAIN}/blog.html`,
    ogType: 'website',
    ogImage: `${DOMAIN}/assets/speakerpartpro-hero-banner.png`
  },
  'track-shipment.html': {
    title: 'Track Your Shipment | SPEAKERPARTPRO',
    description: 'Track your international wholesale speaker parts order dispatched via DHL Express, FedEx Priority, or Ocean Freight from SPEAKERPARTPRO.',
    canonical: `${DOMAIN}/track-shipment.html`,
    ogType: 'website',
    ogImage: `${DOMAIN}/assets/icon.png`
  },
  'terms-of-supply.html': {
    title: 'Terms of Supply & B2B Commercial Policies | SPEAKERPARTPRO',
    description: 'Commercial terms of supply, export incoterms (FOB/CIF), minimum order quantities (MOQ), and quality tolerances for SPEAKERPARTPRO.',
    canonical: `${DOMAIN}/terms-of-supply.html`,
    ogType: 'website',
    ogImage: `${DOMAIN}/assets/icon.png`
  },
  'terms.html': {
    title: 'Terms & Conditions of Website Use | SPEAKERPARTPRO',
    description: 'Terms and conditions of website use and B2B engagement for SPEAKERPARTPRO.',
    canonical: `${DOMAIN}/terms.html`,
    ogType: 'website',
    ogImage: `${DOMAIN}/assets/icon.png`
  },
  'privacy.html': {
    title: 'Privacy Policy | SPEAKERPARTPRO',
    description: 'Privacy policy and data protection terms for SPEAKERPARTPRO.',
    canonical: `${DOMAIN}/privacy.html`,
    ogType: 'website',
    ogImage: `${DOMAIN}/assets/icon.png`
  }
};

const orgSchemaJson = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": ["Organization", "Manufacturer"],
    "name": "SPEAKERPARTPRO",
    "legalName": "BEE & CEE (SPEAKERPARTPRO)",
    "url": "${DOMAIN}",
    "logo": "${DOMAIN}/assets/icon.png",
    "image": "${DOMAIN}/assets/speakerpartpro-hero-banner.png",
    "description": "B2B manufacturer and global wholesale exporter of precision electro-acoustic loudspeaker components, voice coils, paper cones, surrounds, spiders, and recone kits.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Plot no. 84, Ramsingh pura Bas, Sanganer, Shri Ram colony, Pratap Nagar",
      "addressLocality": "Jaipur",
      "addressRegion": "Rajasthan",
      "postalCode": "302029",
      "addressCountry": "IN"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+91-92521-92491",
        "contactType": "sales",
        "email": "speakerpartpro@gmail.com",
        "areaServed": ["US", "GB", "DE", "FR", "IT", "ES", "NL", "AU", "IN", "Worldwide"],
        "availableLanguage": ["English", "Hindi"]
      }
    ],
    "email": "speakerpartpro@gmail.com"
  }
  </script>`;

const fontPreconnectTags = `
  <!-- Google Fonts Preconnect & Async Load -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Rajdhani:wght@500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap">`;

Object.entries(pageConfigs).forEach(([fileName, cfg]) => {
  const filePath = path.join(ROOT_DIR, fileName);
  if (!fs.existsSync(filePath)) return;

  let html = fs.readFileSync(filePath, 'utf8');

  // Strip existing title, meta description, canonical, OG tags, preconnects
  html = html.replace(/<title>.*?<\/title>/is, '');
  html = html.replace(/<meta\s+name=["']description["'][^>]*>/is, '');
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/is, '');
  html = html.replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gis, '');
  html = html.replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gis, '');
  html = html.replace(/<link\s+rel=["']preconnect["'][^>]*>/gis, '');
  html = html.replace(/<!--\s*Google Fonts Preconnect[\s\S]*?-->/gis, '');

  const newHeadContent = `
  <title>${cfg.title}</title>
  <meta name="description" content="${cfg.description}">
  <link rel="canonical" href="${cfg.canonical}">
  ${fontPreconnectTags}

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${cfg.ogType}">
  <meta property="og:url" content="${cfg.canonical}">
  <meta property="og:title" content="${cfg.title}">
  <meta property="og:description" content="${cfg.description}">
  <meta property="og:image" content="${cfg.ogImage}">
  <meta property="og:site_name" content="SPEAKERPARTPRO">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${cfg.canonical}">
  <meta name="twitter:title" content="${cfg.title}">
  <meta name="twitter:description" content="${cfg.description}">
  <meta name="twitter:image" content="${cfg.ogImage}">
  ${cfg.hasOrgSchema ? orgSchemaJson : ''}
`;

  html = html.replace('</head>', `${newHeadContent}\n</head>`);

  // Explicit image dimensions for CLS fixes
  if (fileName === 'index.html') {
    html = html.replace(
      /<img src="\/assets\/speakerpartpro-hero-banner\.png[^"]*"/,
      '<img src="/assets/speakerpartpro-hero-banner.png?v=spp12" width="1024" height="512"'
    );
    html = html.replace(
      /<img src="\/assets\/recone-kit-banner\.jpg"/,
      '<img src="/assets/recone-kit-banner.jpg" width="1200" height="400"'
    );
  }

  fs.writeFileSync(filePath, html, 'utf8');

  // Also sync to pages/ if exists
  const pagesPath = path.join(ROOT_DIR, 'pages', fileName);
  if (fs.existsSync(pagesPath)) {
    fs.writeFileSync(pagesPath, html, 'utf8');
  }

  console.log(`Updated head tags & SEO metadata for ${fileName}`);
});

console.log('All static pages successfully optimized for Core Web Vitals & SERP display!');
