const fs = require('fs');
const path = require('path');

const ROOT_DIR = 'C:/Users/Hp/.gemini/antigravity/scratch/thespeakerpartsco';
const DOMAIN = 'https://speakerpartpro.vercel.app';

// Read data
const prodTemplate = fs.readFileSync(path.join(ROOT_DIR, 'product-detail.html'), 'utf8');
const catTemplate = fs.readFileSync(path.join(ROOT_DIR, 'category.html'), 'utf8');
const blogTemplate = fs.readFileSync(path.join(ROOT_DIR, 'blog-post.html'), 'utf8');

const products = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'products.json'), 'utf8'));
const categories = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'categories.json'), 'utf8'));
let blogs = [];
try {
  blogs = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'blogs.json'), 'utf8'));
} catch (e) {}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const POPOUT_MAP = {
  'voice-coils': '/assets/voice-coil-popout.png',
  'speaker-cones': '/assets/speaker-cone-popout.png',
  'speaker-surrounds': '/assets/speaker-surround-popout.png',
  'speaker-spiders': '/assets/speaker-spider-popout.png',
  'dust-caps': '/assets/dust-cap-popout.png',
  'diaphragms': '/assets/category-diaphragms-popout.png',
  'lead-wires': '/assets/category-terminals-leadwire-popout.png',
  'speaker-terminals': '/assets/category-terminals-leadwire-popout.png',
  'subwoofers': '/assets/subwoofer-popout.png',
  'speaker-edge-ports': '/assets/collage-surrounds.jpg',
  'custom-recone-kits': '/assets/recone-kit-banner.jpg',
  'custom-repair-kits': '/assets/recone-kit-banner.jpg'
};

// -------------------------------------------------------------
// 1. PRE-RENDER 200 PRODUCT PAGES
// -------------------------------------------------------------
let prodCount = 0;

products.forEach(p => {
  if (p.is_hidden) return;

  const catSlug = p.category_slug || 'products';
  const catName = p.category_name || catSlug.replace(/-/g, ' ').toUpperCase();
  const canonicalUrl = `${DOMAIN}/${catSlug}/${p.slug}`;
  const imgUrl = p.featured_image ? (p.featured_image.startsWith('http') ? p.featured_image : `${DOMAIN}${p.featured_image}`) : `${DOMAIN}/assets/voice-coil-popout.png`;

  let price = null;
  let priceFormatted = 'Inquire for B2B Pricing';
  if (p.variants && p.variants.length > 0 && p.variants[0].price) {
    price = p.variants[0].price;
    priceFormatted = `$${Number(price).toFixed(2)} USD`;
  } else if (p.variants && p.variants.price) {
    price = p.variants.price;
    priceFormatted = `$${Number(price).toFixed(2)} USD`;
  }

  const pageTitle = `${p.name} | SPEAKERPARTPRO`;
  const metaDesc = p.short_desc || p.seo_meta?.description || `Wholesale ${p.name} replacement loudspeaker component manufactured by SPEAKERPARTPRO. High precision engineering, MOQ ${p.moq || '500 units'}, international export ready.`;

  const specs = [];
  specs.push(['Component Type', catName]);
  specs.push(['Minimum Order Quantity (MOQ)', p.moq || '500 units (Sample orders available)']);
  specs.push(['Production Lead Time', 'Evaluation samples 3–5 days; production run 2–3 weeks']);
  specs.push(['Export Packaging', 'Reinforced moisture-barrier export cartons / wooden crates']);
  specs.push(['Harmonized System (HS) Code', '8518.90.00 (Parts of Loudspeakers)']);

  const rawSpecs = p.variants && (p.variants[0]?.specs || p.variants.specs);
  if (rawSpecs) {
    try {
      const parsed = typeof rawSpecs === 'object' ? rawSpecs : JSON.parse(rawSpecs);
      for (const [k, v] of Object.entries(parsed)) {
        specs.push([k.replace(/_/g, ' ').toUpperCase(), v]);
      }
    } catch (e) {}
  }

  const specsHtml = specs.map(([k, v]) => `
            <tr>
              <th>${escapeHtml(k)}</th>
              <td>${escapeHtml(v)}</td>
            </tr>`).join('\n');

  let compatibilityHtml = '';
  if (p.seo_meta && p.seo_meta.speaker_compatibility && Array.isArray(p.seo_meta.speaker_compatibility)) {
    compatibilityHtml = `
        <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border);">
          <h3 style="font-family: var(--font-display); font-size: 15px; font-weight: 700; text-transform: uppercase; color: var(--text-primary); margin-bottom: 0.75rem;">
            Verified Speaker & Subwoofer Compatibility
          </h3>
          <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 13px;">
            ${p.seo_meta.speaker_compatibility.map(item => `
              <div>
                <strong style="color: var(--accent);">${escapeHtml(item.brand)}:</strong>
                <span style="color: var(--text-secondary); margin-left: 0.4rem;">${Array.isArray(item.models) ? item.models.map(m => escapeHtml(m)).join(', ') : escapeHtml(item.models)}</span>
              </div>
            `).join('')}
          </div>
        </div>`;
  }

  const schemaOrg = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${canonicalUrl}#product`,
        "name": p.name,
        "description": metaDesc,
        "image": imgUrl,
        "sku": p.id,
        "mpn": p.slug,
        "category": catName,
        "brand": {
          "@type": "Brand",
          "name": "SPEAKERPARTPRO"
        },
        "manufacturer": {
          "@type": "Organization",
          "name": "SPEAKERPARTPRO",
          "url": DOMAIN,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Plot no. 84, Ramsingh pura Bas, Sanganer",
            "addressLocality": "Jaipur",
            "addressRegion": "Rajasthan",
            "postalCode": "302029",
            "addressCountry": "IN"
          }
        },
        "offers": {
          "@type": "Offer",
          "url": canonicalUrl,
          "priceCurrency": "USD",
          "price": price ? Number(price).toFixed(2) : "1.00",
          "priceValidUntil": "2027-12-31",
          "availability": "https://schema.org/InStock",
          "itemCondition": "https://schema.org/NewCondition",
          "eligibleQuantity": {
            "@type": "QuantitativeValue",
            "value": p.moq ? parseInt(p.moq) || 500 : 500,
            "unitCode": "C62"
          }
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": DOMAIN
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": catName,
            "item": `${DOMAIN}/${catSlug}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": p.name,
            "item": canonicalUrl
          }
        ]
      }
    ]
  };

  const schemaJsonLd = `<script type="application/ld+json">\n${JSON.stringify(schemaOrg, null, 2)}\n  </script>`;

  let html = prodTemplate;

  // Remove existing generic meta description and title
  html = html.replace(/<title>.*?<\/title>/i, '');
  html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, '');

  const headMetaBlock = `
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(metaDesc)}">
  <link rel="canonical" href="${canonicalUrl}">
  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${escapeHtml(metaDesc)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="product">
  <meta property="og:image" content="${imgUrl}">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
  <meta name="twitter:description" content="${escapeHtml(metaDesc)}">
  <meta name="twitter:image" content="${imgUrl}">
  ${schemaJsonLd}
`;

  html = html.replace('</head>', `${headMetaBlock}\n</head>`);

  // Pre-fill Breadcrumbs
  html = html.replace(
    /<a id="breadcrumbCat"[^>]*>.*?<\/a>/i,
    `<a id="breadcrumbCat" href="/${catSlug}" style="color: var(--text-secondary);">${escapeHtml(catName)}</a>`
  );
  html = html.replace(
    /<span id="breadcrumbTitle"[^>]*>.*?<\/span>/i,
    `<span id="breadcrumbTitle" style="color: var(--accent); font-weight: 700;">${escapeHtml(p.name)}</span>`
  );

  // Pre-fill Detail Category & H1 Title
  html = html.replace(
    /<div id="detailCategory"[^>]*>[\s\S]*?<\/div>/,
    `<div id="detailCategory" style="font-family: var(--font-display); font-size: 14px; font-weight: 800; text-transform: uppercase; color: var(--accent); letter-spacing: 0.1em; margin-bottom: 0.5rem;">${escapeHtml(catName)} • SPEAKERPARTPRO</div>`
  );
  html = html.replace(
    /<h1 id="detailTitle"[^>]*>[\s\S]*?<\/h1>/,
    `<h1 id="detailTitle" style="font-family: var(--font-display); font-size: 32px; font-weight: 800; color: var(--text-primary); line-height: 1.3; margin-bottom: 1rem;">${escapeHtml(p.name)}</h1>`
  );

  // Pre-fill Price & MOQ
  html = html.replace(
    /<div id="detailPrice"[^>]*>[\s\S]*?<\/div>/,
    `<div id="detailPrice" style="font-family: var(--font-mono); font-size: 26px; font-weight: 800; color: var(--accent);"${price ? ` data-usd-price="${price}"` : ''}>${escapeHtml(priceFormatted)}</div>`
  );
  html = html.replace(
    /<div id="detailMoq"[^>]*>[\s\S]*?<\/div>/,
    `<div id="detailMoq" style="font-size: 13px; background: var(--bg-secondary); border: 1px solid var(--border-strong); color: var(--text-secondary); padding: 0.25rem 0.65rem; border-radius: 6px; font-weight: 600;">MOQ: ${escapeHtml(p.moq || '500 units')}</div>`
  );

  // Pre-fill Short Description & Applications
  html = html.replace(
    /<div id="detailShortDesc"[^>]*>[\s\S]*?<\/div>/,
    `<div id="detailShortDesc" style="font-size: 15.5px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 2rem; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 1.25rem 0;">${escapeHtml(p.short_desc || p.applications || 'Precision electro-acoustic transducer component engineered for high durability and acoustic accuracy.')}</div>`
  );
  html = html.replace(
    /<p id="detailApplications"[^>]*>[\s\S]*?<\/p>/,
    `<p id="detailApplications" style="font-size: 14.5px; color: var(--text-secondary); line-height: 1.7;">${escapeHtml(p.applications || 'High-output audio systems, pro touring sound enclosures, competition SPL car audio subwoofers, and B2B OEM manufacturing.')}</p>`
  );

  // Pre-fill Image with explicit width/height
  html = html.replace(
    /<img id="mainProductImage"[^>]*>/,
    `<img id="mainProductImage" src="${p.featured_image || '/assets/voice-coil-popout.png'}" alt="${escapeHtml(p.name)} - wholesale speaker transducer component" style="max-width: 90%; max-height: 90%; object-fit: contain; transition: transform 0.3s ease;" width="500" height="500">`
  );

  // Pre-fill Specs Table and append Compatibility HTML
  html = html.replace(
    /<table class="spec-table" id="specsTable">[\s\S]*?<\/table>/,
    `<table class="spec-table" id="specsTable">\n${specsHtml}\n          </table>`
  );

  if (compatibilityHtml) {
    html = html.replace('</section>\n\n      <!-- Related Products', `${compatibilityHtml}\n      </section>\n\n      <!-- Related Products`);
  }

  const targetDir = path.join(ROOT_DIR, catSlug);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetFile = path.join(targetDir, `${p.slug}.html`);
  fs.writeFileSync(targetFile, html, 'utf8');
  prodCount++;
});

// -------------------------------------------------------------
// 2. PRE-RENDER 10 ACTIVE CATEGORY PAGES
// -------------------------------------------------------------
let catCount = 0;

categories.forEach(c => {
  const catProducts = products.filter(p => p.category_slug === c.slug && !p.is_hidden);
  const canonicalUrl = `${DOMAIN}/${c.slug}`;
  const pageTitle = `${c.name} | SPEAKERPARTPRO`;
  const metaDesc = `Wholesale ${c.name} manufactured by SPEAKERPARTPRO. Factory-direct loudspeaker replacement parts engineered for OEM audio brands, reconers, and distributors worldwide. Showing ${catProducts.length} models.`;
  const popoutImg = POPOUT_MAP[c.slug] || '/assets/voice-coil-popout.png';

  const schemaOrg = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#collection`,
        "name": `${c.name} Catalog`,
        "description": metaDesc,
        "url": canonicalUrl,
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": catProducts.map((p, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "url": `${DOMAIN}/${c.slug}/${p.slug}`,
            "name": p.name
          }))
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": DOMAIN
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": c.name,
            "item": canonicalUrl
          }
        ]
      }
    ]
  };

  const schemaJsonLd = `<script type="application/ld+json">\n${JSON.stringify(schemaOrg, null, 2)}\n  </script>`;

  let html = catTemplate;

  // Remove existing generic title and description
  html = html.replace(/<title>.*?<\/title>/i, '');
  html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, '');

  const headMetaBlock = `
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(metaDesc)}">
  <link rel="canonical" href="${canonicalUrl}">
  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${escapeHtml(metaDesc)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${DOMAIN}${popoutImg}">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
  <meta name="twitter:description" content="${escapeHtml(metaDesc)}">
  <meta name="twitter:image" content="${DOMAIN}${popoutImg}">
  ${schemaJsonLd}
`;

  html = html.replace('</head>', `${headMetaBlock}\n</head>`);

  // Pre-fill Breadcrumb & Titles
  html = html.replace(
    /<span id="catBreadcrumb"[^>]*>.*?<\/span>/i,
    `<span id="catBreadcrumb" style="color: var(--accent); font-weight: 700;">${escapeHtml(c.name)}</span>`
  );
  html = html.replace(
    /<h1 id="catTitle"[^>]*>.*?<\/h1>/i,
    `<h1 id="catTitle" style="font-family: var(--font-display); font-size: 36px; font-weight: 900; text-transform: uppercase; color: var(--text-primary); margin-bottom: 1rem;">${escapeHtml(c.name)}</h1>`
  );
  html = html.replace(
    /<p id="catDesc"[^>]*>.*?<\/p>/i,
    `<p id="catDesc" style="font-size: 14px; color: var(--text-secondary); line-height: 1.7; max-width: 720px; margin-bottom: 1.5rem;">${escapeHtml(c.description || 'Precision loudspeaker components engineered for OEM manufacturers, audio brands, and reconing professionals worldwide.')}</p>`
  );
  html = html.replace(
    /<strong style="color: var\(--text-primary\);" id="catProdCount">.*?<\/strong>/i,
    `<strong style="color: var(--text-primary);" id="catProdCount">${catProducts.length}</strong>`
  );
  html = html.replace(
    /<img id="catPopoutImg"[^>]*>/i,
    `<img id="catPopoutImg" src="${popoutImg}" alt="${escapeHtml(c.name)}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`
  );

  // Pre-fill Product Cards Grid
  const productsGridHtml = catProducts.map(p => {
    const img = p.featured_image || '/assets/voice-coil-popout.png';
    const price = p.variants && p.variants.price ? `$${Number(p.variants.price).toFixed(2)} USD` : 'B2B RFQ';
    const badge = p.seo_meta && p.seo_meta.badge_text ? p.seo_meta.badge_text : (p.is_featured ? 'PRO SPEC' : null);
    const productUrl = `/${c.slug}/${p.slug}`;

    return `
      <div class="product-card">
        <a href="${productUrl}">
          <div class="product-img-wrapper">
            ${badge ? `<span class="product-badge">${badge}</span>` : ''}
            <img src="${img}" alt="${escapeHtml(p.name)} - wholesale speaker component" loading="lazy" onerror="this.src='/assets/voice-coil-popout.png'">
            <div class="product-watermark">
              <img src="/assets/speakerpartpro-horizontal-light.png" alt="SPEAKERPARTPRO" loading="lazy">
            </div>
          </div>
        </a>
        <div class="product-details">
          <div>
            <a href="${productUrl}">
              <h3 style="font-size: 15px; font-weight: 700; color: var(--text-primary); line-height: 1.4; margin-bottom: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" title="${escapeHtml(p.name)}">
                ${escapeHtml(p.name)}
              </h3>
            </a>
            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 0.75rem;">
              MOQ: ${escapeHtml(p.moq || '500 units')}
            </div>
          </div>
          <div>
            <div style="font-family: var(--font-mono); font-size: 15.5px; font-weight: 700; color: var(--accent); margin-bottom: 0.75rem;">
              ${price}
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button onclick="window.TSPC.addToCart({ id: '${p.id}', name: '${p.name.replace(/'/g, "\\'")}', slug: '${p.slug}', featured_image: '${img}', moq: '${p.moq || '500 units'}', variants: { price: ${p.variants && p.variants.price ? p.variants.price : 'null'} } })" class="btn-accent" style="flex: 1; padding: 0.55rem; font-size: 12px;">
                Add to RFQ
              </button>
              <a href="${productUrl}">
                <button class="btn-outline" style="padding: 0.55rem 0.8rem; font-size: 12px;">
                  Specs
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('\n');

  html = html.replace(
    /<div id="catProductsGrid"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/main>/,
    `<div id="catProductsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem;">\n${productsGridHtml}\n      </div>\n    </div>\n  </main>`
  );

  // Write category page to both {c.slug}.html and {c.slug}/index.html
  const catDir = path.join(ROOT_DIR, c.slug);
  if (!fs.existsSync(catDir)) {
    fs.mkdirSync(catDir, { recursive: true });
  }
  fs.writeFileSync(path.join(ROOT_DIR, `${c.slug}.html`), html, 'utf8');
  fs.writeFileSync(path.join(catDir, 'index.html'), html, 'utf8');
  catCount++;
});

// -------------------------------------------------------------
// 3. PRE-RENDER 8 BLOG ARTICLES
// -------------------------------------------------------------
let blogCount = 0;
const blogDir = path.join(ROOT_DIR, 'blog');
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}

blogs.forEach(b => {
  const canonicalUrl = `${DOMAIN}/blog/${b.slug}`;
  const pageTitle = `${b.title} | SPEAKERPARTPRO`;
  const metaDesc = b.description || `${b.title} - technical engineering and loudspeaker parts guide by SPEAKERPARTPRO.`;

  const schemaOrg = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${canonicalUrl}#article`,
        "headline": b.title,
        "description": metaDesc,
        "url": canonicalUrl,
        "datePublished": "2026-09-01T00:00:00Z",
        "dateModified": "2026-10-20T00:00:00Z",
        "author": {
          "@type": "Organization",
          "name": "SPEAKERPARTPRO Engineering Team",
          "url": DOMAIN
        },
        "publisher": {
          "@type": "Organization",
          "name": "SPEAKERPARTPRO",
          "url": DOMAIN,
          "logo": {
            "@type": "ImageObject",
            "url": `${DOMAIN}/assets/icon.png`
          }
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": DOMAIN
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Engineering Hub",
            "item": `${DOMAIN}/blog.html`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": b.title,
            "item": canonicalUrl
          }
        ]
      }
    ]
  };

  const schemaJsonLd = `<script type="application/ld+json">\n${JSON.stringify(schemaOrg, null, 2)}\n  </script>`;

  let html = blogTemplate;

  html = html.replace(/<title>.*?<\/title>/i, '');
  html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, '');

  const headMetaBlock = `
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(metaDesc)}">
  <link rel="canonical" href="${canonicalUrl}">
  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${escapeHtml(metaDesc)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="article">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
  <meta name="twitter:description" content="${escapeHtml(metaDesc)}">
  ${schemaJsonLd}
`;

  html = html.replace('</head>', `${headMetaBlock}\n</head>`);

  // Pre-fill Blog Content
  html = html.replace(
    /<span id="postBreadcrumb"[^>]*>.*?<\/span>/i,
    `<span id="postBreadcrumb" style="color: var(--accent); font-weight: 700;">${escapeHtml(b.title)}</span>`
  );
  html = html.replace(
    /<h1 id="postTitle"[^>]*>.*?<\/h1>/i,
    `<h1 id="postTitle" style="font-family: var(--font-display); font-size: clamp(28px, 3.5vw, 42px); font-weight: 900; color: var(--text-primary); line-height: 1.25; margin-bottom: 1.25rem;">${escapeHtml(b.title)}</h1>`
  );
  html = html.replace(
    /<span id="postCategory"[^>]*>.*?<\/span>/i,
    `<span id="postCategory" style="background: var(--accent-light); color: var(--accent); font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: var(--radius-sm); border: 1px solid rgba(255, 90, 0, 0.2);">${escapeHtml(b.category || 'Technical Guide')}</span>`
  );
  html = html.replace(
    /<div id="postContent"[^>]*>[\s\S]*?<\/div>/,
    `<div id="postContent" style="font-size: 15px; color: var(--text-secondary); line-height: 1.8;">${b.content || `<p>${escapeHtml(b.description)}</p>`}</div>`
  );

  fs.writeFileSync(path.join(blogDir, `${b.slug}.html`), html, 'utf8');
  blogCount++;
});

console.log('====================================================');
console.log(`Pre-Render Complete:`);
console.log(`- Pre-rendered Products:   ${prodCount}`);
console.log(`- Pre-rendered Categories: ${catCount} (HTML & directories)`);
console.log(`- Pre-rendered Blog Posts: ${blogCount}`);
console.log('====================================================');
