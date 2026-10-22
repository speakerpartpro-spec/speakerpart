const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DOMAIN = 'https://speakerpartpro.vercel.app';
const TODAY = new Date().toISOString().split('T')[0];

const categories = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'categories.json'), 'utf8'));
const products = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'products.json'), 'utf8'));
let blogs = [];
try {
  blogs = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'blogs.json'), 'utf8'));
} catch (e) {}

const corePages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/products.html', priority: '0.9', changefreq: 'daily' },
  { url: '/about.html', priority: '0.8', changefreq: 'monthly' },
  { url: '/process.html', priority: '0.8', changefreq: 'monthly' },
  { url: '/export.html', priority: '0.8', changefreq: 'monthly' },
  { url: '/contact.html', priority: '0.8', changefreq: 'monthly' },
  { url: '/gallery.html', priority: '0.7', changefreq: 'weekly' },
  { url: '/blog.html', priority: '0.8', changefreq: 'weekly' },
  { url: '/track-shipment.html', priority: '0.6', changefreq: 'monthly' },
  { url: '/terms-of-supply.html', priority: '0.5', changefreq: 'monthly' },
  { url: '/terms.html', priority: '0.3', changefreq: 'yearly' },
  { url: '/privacy.html', priority: '0.3', changefreq: 'yearly' }
];

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

// 1. Core Pages
corePages.forEach(p => {
  xml += '  <url>\n';
  xml += `    <loc>${DOMAIN}${p.url}</loc>\n`;
  xml += `    <lastmod>${TODAY}</lastmod>\n`;
  xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
  xml += `    <priority>${p.priority}</priority>\n`;
  xml += '  </url>\n';
});

// 2. Category Pages (Both clean rewrite path and query fallback)
categories.forEach(c => {
  // Clean rewritten URL
  xml += '  <url>\n';
  xml += `    <loc>${DOMAIN}/${c.slug}</loc>\n`;
  xml += `    <lastmod>${TODAY}</lastmod>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>0.85</priority>\n`;
  xml += '  </url>\n';
  
  // Standard query URL
  xml += '  <url>\n';
  xml += `    <loc>${DOMAIN}/category.html?slug=${c.slug}</loc>\n`;
  xml += `    <lastmod>${TODAY}</lastmod>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>0.80</priority>\n`;
  xml += '  </url>\n';
});

// 3. Product Pages (Clean rewritten path and query fallback)
products.forEach(p => {
  if (p.is_hidden) return;
  const catSlug = p.category_slug || 'products';
  
  // Clean rewritten URL (e.g. /voice-coils/copper-voice-coil-75mm)
  xml += '  <url>\n';
  xml += `    <loc>${DOMAIN}/${catSlug}/${p.slug}</loc>\n`;
  xml += `    <lastmod>${TODAY}</lastmod>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>0.80</priority>\n`;
  xml += '  </url>\n';

  // Standard query URL (e.g. /product-detail.html?slug=...)
  xml += '  <url>\n';
  xml += `    <loc>${DOMAIN}/product-detail.html?slug=${p.slug}</loc>\n`;
  xml += `    <lastmod>${TODAY}</lastmod>\n`;
  xml += `    <changefreq>weekly</changefreq>\n`;
  xml += `    <priority>0.75</priority>\n`;
  xml += '  </url>\n';
});

// 4. Blog Guides
blogs.forEach(b => {
  xml += '  <url>\n';
  xml += `    <loc>${DOMAIN}/blog-post.html?slug=${b.slug}</loc>\n`;
  xml += `    <lastmod>${TODAY}</lastmod>\n`;
  xml += `    <changefreq>monthly</changefreq>\n`;
  xml += `    <priority>0.70</priority>\n`;
  xml += '  </url>\n';
});

xml += '</urlset>\n';

// Write to root and public/
fs.writeFileSync(path.join(ROOT_DIR, 'sitemap.xml'), xml, 'utf8');
fs.writeFileSync(path.join(ROOT_DIR, 'public', 'sitemap.xml'), xml, 'utf8');

console.log('Successfully generated sitemap.xml with entries:');
console.log('- Core Pages:', corePages.length);
console.log('- Category URLs:', categories.length * 2);
console.log('- Product URLs:', products.filter(p => !p.is_hidden).length * 2);
console.log('- Blog URLs:', blogs.length);
console.log('- Total URLs:', corePages.length + (categories.length * 2) + (products.filter(p => !p.is_hidden).length * 2) + blogs.length);
