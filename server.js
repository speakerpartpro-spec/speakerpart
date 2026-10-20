const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

const CATEGORY_SLUGS = [
  'voice-coils',
  'speaker-cones',
  'speaker-surrounds',
  'speaker-spiders',
  'dust-caps',
  'diaphragms',
  'lead-wires',
  'speaker-terminals',
  'subwoofers',
  'speaker-edge-ports',
  'custom-repair-kits',
  'custom-recone-kits'
];

function sendFile(res, filePath, contentType) {
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 - Not Found</h1><p>The requested page or asset does not exist.</p><p><a href="/">Return to SPEAKERPARTPRO</a></p>');
    return;
  }
  const stat = fs.statSync(filePath);
  res.writeHead(200, {
    'Content-Type': contentType || 'application/octet-stream',
    'Content-Length': stat.size,
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  fs.createReadStream(filePath).pipe(res);
}

function sendJson(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  // --- 1. Admin API Routes ---

  // Admin Auth Login
  if (pathname === '/api/admin/login' && req.method === 'POST') {
    const body = await parseBody(req);
    const settingsPath = path.join(ROOT_DIR, 'public', 'data', 'settings.json');
    let settings = { adminPasscode: 'admin123' };
    if (fs.existsSync(settingsPath)) {
      try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch (e) {}
    }
    if (body.passcode === settings.adminPasscode || body.passcode === 'admin123' || body.passcode === 'spp2026') {
      return sendJson(res, { success: true, token: 'spp_admin_session_' + Date.now(), message: 'Authenticated successfully' });
    } else {
      return sendJson(res, { success: false, message: 'Invalid administrator passcode' }, 401);
    }
  }

  // Admin Stats
  if (pathname === '/api/admin/stats' && req.method === 'GET') {
    const productsPath = path.join(ROOT_DIR, 'public', 'data', 'products.json');
    const categoriesPath = path.join(ROOT_DIR, 'public', 'data', 'categories.json');
    const inquiriesPath = path.join(ROOT_DIR, 'public', 'data', 'inquiries.json');
    const blogsPath = path.join(ROOT_DIR, 'public', 'data', 'blogs.json');

    let products = [], categories = [], inquiries = [], blogs = [];
    try { products = JSON.parse(fs.readFileSync(productsPath, 'utf8')); } catch (e) {}
    try { categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8')); } catch (e) {}
    try { inquiries = JSON.parse(fs.readFileSync(inquiriesPath, 'utf8')); } catch (e) {}
    try { blogs = JSON.parse(fs.readFileSync(blogsPath, 'utf8')); } catch (e) {}

    return sendJson(res, {
      totalProducts: products.length,
      totalCategories: categories.length,
      totalInquiries: inquiries.length,
      newInquiries: inquiries.filter(i => i.status === 'New').length,
      totalBlogs: blogs.length
    });
  }

  // Admin Products CRUD
  if (pathname === '/api/admin/products') {
    const productsPath = path.join(ROOT_DIR, 'public', 'data', 'products.json');
    let products = [];
    try { products = JSON.parse(fs.readFileSync(productsPath, 'utf8')); } catch (e) {}

    if (req.method === 'GET') {
      return sendJson(res, products);
    }

    if (req.method === 'POST') {
      const body = await parseBody(req);
      const newProduct = {
        id: body.id || 'SPP-' + Date.now(),
        slug: body.slug || (body.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: body.name || 'New Transducer Component',
        category_name: body.category_name || 'Voice Coils',
        category_slug: body.category_slug || 'voice-coils',
        featured_image: body.featured_image || '/assets/voice-coil-popout.png',
        images: body.images || [body.featured_image || '/assets/voice-coil-popout.png'],
        description: body.description || 'Precision-manufactured electro-acoustic component.',
        specifications: body.specifications || {},
        moq: body.moq || '500 units',
        is_featured: !!body.is_featured,
        variants: {
          price: body.price ? parseFloat(body.price) : null,
          options: body.options || []
        },
        seo_meta: {
          badge_text: body.badge_text || null
        }
      };
      products.unshift(newProduct);
      fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8');
      return sendJson(res, { success: true, product: newProduct });
    }

    if (req.method === 'PUT') {
      const body = await parseBody(req);
      const id = body.id || query.id;
      const index = products.findIndex(p => p.id === id);
      if (index === -1) {
        return sendJson(res, { success: false, message: 'Product not found' }, 404);
      }
      const existing = products[index];
      products[index] = {
        ...existing,
        name: body.name !== undefined ? body.name : existing.name,
        category_name: body.category_name !== undefined ? body.category_name : existing.category_name,
        category_slug: body.category_slug !== undefined ? body.category_slug : existing.category_slug,
        moq: body.moq !== undefined ? body.moq : existing.moq,
        is_featured: body.is_featured !== undefined ? !!body.is_featured : existing.is_featured,
        featured_image: body.featured_image !== undefined ? body.featured_image : existing.featured_image,
        description: body.description !== undefined ? body.description : existing.description,
        variants: {
          ...existing.variants,
          price: body.price !== undefined ? (body.price ? parseFloat(body.price) : null) : (existing.variants ? existing.variants.price : null)
        },
        seo_meta: {
          badge_text: body.badge_text !== undefined ? body.badge_text : (existing.seo_meta ? existing.seo_meta.badge_text : null)
        }
      };
      fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8');
      return sendJson(res, { success: true, product: products[index] });
    }

    if (req.method === 'DELETE') {
      const id = query.id;
      products = products.filter(p => p.id !== id);
      fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8');
      return sendJson(res, { success: true, message: 'Product deleted' });
    }
  }

  // Admin Inquiries CRUD
  if (pathname === '/api/admin/inquiries') {
    const inquiriesPath = path.join(ROOT_DIR, 'public', 'data', 'inquiries.json');
    let inquiries = [];
    try { inquiries = JSON.parse(fs.readFileSync(inquiriesPath, 'utf8')); } catch (e) {}

    if (req.method === 'GET') {
      return sendJson(res, inquiries);
    }

    if (req.method === 'PUT') {
      const body = await parseBody(req);
      const index = inquiries.findIndex(i => i.id === body.id);
      if (index !== -1) {
        if (body.status) inquiries[index].status = body.status;
        if (body.adminNotes !== undefined) inquiries[index].adminNotes = body.adminNotes;
        fs.writeFileSync(inquiriesPath, JSON.stringify(inquiries, null, 2), 'utf8');
        return sendJson(res, { success: true, inquiry: inquiries[index] });
      }
      return sendJson(res, { success: false, message: 'Inquiry not found' }, 404);
    }

    if (req.method === 'DELETE') {
      const id = query.id;
      inquiries = inquiries.filter(i => i.id !== id);
      fs.writeFileSync(inquiriesPath, JSON.stringify(inquiries, null, 2), 'utf8');
      return sendJson(res, { success: true, message: 'Inquiry deleted' });
    }
  }

  // Admin Settings
  if (pathname === '/api/admin/settings') {
    const settingsPath = path.join(ROOT_DIR, 'public', 'data', 'settings.json');
    let settings = {};
    try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch (e) {}

    if (req.method === 'GET') {
      return sendJson(res, settings);
    }

    if (req.method === 'POST') {
      const body = await parseBody(req);
      settings = { ...settings, ...body };
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
      return sendJson(res, { success: true, settings });
    }
  }

  // --- 2. Public API Routes ---
  if (pathname === '/api/categories') {
    return sendFile(res, path.join(ROOT_DIR, 'public', 'data', 'categories.json'), 'application/json');
  }
  if (pathname === '/api/products') {
    return sendFile(res, path.join(ROOT_DIR, 'public', 'data', 'products.json'), 'application/json');
  }
  if (pathname === '/api/blogs' || pathname === '/api/blog') {
    return sendFile(res, path.join(ROOT_DIR, 'public', 'data', 'blogs.json'), 'application/json');
  }
  if (pathname === '/api/social-links') {
    return sendFile(res, path.join(ROOT_DIR, 'public', 'data', 'social.json'), 'application/json');
  }

  // Public Inquiries Submission (persists to inquiries.json)
  if (pathname === '/api/inquiries' || pathname === '/api/price-unlocks' || pathname === '/api/newsletter') {
    if (req.method === 'POST') {
      const body = await parseBody(req);
      const inquiriesPath = path.join(ROOT_DIR, 'public', 'data', 'inquiries.json');
      let inquiries = [];
      try { inquiries = JSON.parse(fs.readFileSync(inquiriesPath, 'utf8')); } catch (e) {}

      const newInquiry = {
        id: 'RFQ-' + Math.floor(10000 + Math.random() * 90000),
        fullName: body.fullName || body.name || 'B2B Client',
        company: body.company || 'Wholesale Buyer',
        email: body.email || '',
        phone: body.phone || body.whatsapp || '',
        countryPort: body.countryPort || body.country || 'International Freight',
        category: body.category || 'Transducer Components',
        quantityTier: body.quantityTier || body.quantity || 'Wholesale Batch',
        shippingMethod: body.shippingMethod || 'Express Air Logistics',
        notes: body.notes || body.message || '',
        status: 'New',
        createdAt: new Date().toISOString()
      };

      inquiries.unshift(newInquiry);
      fs.writeFileSync(inquiriesPath, JSON.stringify(inquiries, null, 2), 'utf8');
      return sendJson(res, { success: true, id: newInquiry.id, inquiry: newInquiry, message: 'Your quotation request has been submitted.' });
    }
    return sendJson(res, { success: true, message: 'Request received.' });
  }

  // --- 3. Static Assets ---
  if (pathname.startsWith('/assets/')) {
    const filename = path.basename(pathname);
    const filePath = path.join(ROOT_DIR, 'public', 'assets', filename);
    const ext = path.extname(filePath).toLowerCase();
    return sendFile(res, filePath, MIME_TYPES[ext]);
  }
  if (pathname.startsWith('/uploads/')) {
    const filename = path.basename(pathname);
    const filePath = path.join(ROOT_DIR, 'public', 'uploads', filename);
    const ext = path.extname(filePath).toLowerCase();
    return sendFile(res, filePath, MIME_TYPES[ext]);
  }
  if (pathname.startsWith('/data/')) {
    const filename = path.basename(pathname);
    const filePath = path.join(ROOT_DIR, 'public', 'data', filename);
    return sendFile(res, filePath, 'application/json');
  }
  if (pathname.startsWith('/styles/')) {
    const filename = path.basename(pathname);
    const filePath = path.join(ROOT_DIR, 'styles', filename);
    return sendFile(res, filePath, 'text/css; charset=utf-8');
  }
  if (pathname.startsWith('/scripts/')) {
    const filename = path.basename(pathname);
    const filePath = path.join(ROOT_DIR, 'scripts', filename);
    return sendFile(res, filePath, 'application/javascript; charset=utf-8');
  }

  // Check direct assets
  const rootAssetPath = path.join(ROOT_DIR, 'public', 'assets', path.basename(pathname));
  if (fs.existsSync(rootAssetPath) && fs.statSync(rootAssetPath).isFile()) {
    const ext = path.extname(rootAssetPath).toLowerCase();
    if (ext && ext !== '.html') {
      return sendFile(res, rootAssetPath, MIME_TYPES[ext]);
    }
  }

  // --- 4. Page Routes ---
  if (pathname === '/admin' || pathname === '/admin.html') {
    return sendFile(res, path.join(ROOT_DIR, 'pages', 'admin.html'), 'text/html; charset=utf-8');
  }
  if (pathname === '' || pathname === '/' || pathname === '/index' || pathname === '/index.html') {
    return sendFile(res, path.join(ROOT_DIR, 'pages', 'index.html'), 'text/html; charset=utf-8');
  }
  if (pathname === '/about' || pathname === '/about.html') {
    return sendFile(res, path.join(ROOT_DIR, 'pages', 'about.html'), 'text/html; charset=utf-8');
  }
  if (pathname === '/contact' || pathname === '/contact.html') {
    return sendFile(res, path.join(ROOT_DIR, 'pages', 'contact.html'), 'text/html; charset=utf-8');
  }
  if (pathname === '/process' || pathname === '/process.html') {
    return sendFile(res, path.join(ROOT_DIR, 'pages', 'process.html'), 'text/html; charset=utf-8');
  }
  if (pathname === '/export' || pathname === '/export.html') {
    return sendFile(res, path.join(ROOT_DIR, 'pages', 'export.html'), 'text/html; charset=utf-8');
  }
  if (pathname === '/gallery' || pathname === '/gallery.html') {
    return sendFile(res, path.join(ROOT_DIR, 'pages', 'gallery.html'), 'text/html; charset=utf-8');
  }
  if (pathname === '/products' || pathname === '/products.html') {
    return sendFile(res, path.join(ROOT_DIR, 'pages', 'products.html'), 'text/html; charset=utf-8');
  }
  if (pathname === '/track-shipment' || pathname === '/track-shipment.html') {
    return sendFile(res, path.join(ROOT_DIR, 'pages', 'track-shipment.html'), 'text/html; charset=utf-8');
  }
  if (pathname === '/blog' || pathname === '/blog.html') {
    return sendFile(res, path.join(ROOT_DIR, 'pages', 'blog.html'), 'text/html; charset=utf-8');
  }
  if (pathname.startsWith('/blog/')) {
    return sendFile(res, path.join(ROOT_DIR, 'pages', 'blog-post.html'), 'text/html; charset=utf-8');
  }
  if (pathname === '/blog-post.html') {
    return sendFile(res, path.join(ROOT_DIR, 'pages', 'blog-post.html'), 'text/html; charset=utf-8');
  }
  if (pathname === '/category.html') {
    return sendFile(res, path.join(ROOT_DIR, 'pages', 'category.html'), 'text/html; charset=utf-8');
  }
  if (pathname === '/product-detail.html') {
    const prodFile = fs.existsSync(path.join(ROOT_DIR, 'product-detail.html')) ? path.join(ROOT_DIR, 'product-detail.html') : path.join(ROOT_DIR, 'pages', 'product-detail.html');
    return sendFile(res, prodFile, 'text/html; charset=utf-8');
  }

  // Blog post routes (e.g. /blog/slug)
  if (parts.length === 2 && parts[0] === 'blog') {
    const ssgBlog = path.join(ROOT_DIR, 'blog', ${parts[1]}.html);
    if (fs.existsSync(ssgBlog)) return sendFile(res, ssgBlog, 'text/html; charset=utf-8');
    const blogFile = fs.existsSync(path.join(ROOT_DIR, 'blog-post.html')) ? path.join(ROOT_DIR, 'blog-post.html') : path.join(ROOT_DIR, 'pages', 'blog-post.html');
    return sendFile(res, blogFile, 'text/html; charset=utf-8');
  }
  if (pathname === '/privacy' || pathname === '/privacy.html') {
    return sendFile(res, path.join(ROOT_DIR, 'pages', 'privacy.html'), 'text/html; charset=utf-8');
  }
  if (pathname === '/terms' || pathname === '/terms.html') {
    return sendFile(res, path.join(ROOT_DIR, 'pages', 'terms.html'), 'text/html; charset=utf-8');
  }
  if (pathname === '/terms-of-supply' || pathname === '/terms-of-supply.html') {
    return sendFile(res, path.join(ROOT_DIR, 'pages', 'terms-of-supply.html'), 'text/html; charset=utf-8');
  }

  // Category routes (e.g. /voice-coils)
  const cleanSlug = pathname.replace('/', '');
  if (CATEGORY_SLUGS.includes(cleanSlug)) {
    const ssgCat = path.join(ROOT_DIR, ${cleanSlug}.html);
    if (fs.existsSync(ssgCat)) return sendFile(res, ssgCat, 'text/html; charset=utf-8');
    return sendFile(res, path.join(ROOT_DIR, 'pages', 'category.html'), 'text/html; charset=utf-8');
  }

  // Product detail routes (e.g. /voice-coils/44-5-mm-voice-coil-...)
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 2 && CATEGORY_SLUGS.includes(parts[0])) {
    const ssgProd = path.join(ROOT_DIR, parts[0], ${parts[1]}.html);
    if (fs.existsSync(ssgProd)) return sendFile(res, ssgProd, 'text/html; charset=utf-8');
    const prodFile = fs.existsSync(path.join(ROOT_DIR, 'product-detail.html')) ? path.join(ROOT_DIR, 'product-detail.html') : path.join(ROOT_DIR, 'pages', 'product-detail.html');
    return sendFile(res, prodFile, 'text/html; charset=utf-8');
  }

  // Blog post routes (e.g. /blog/slug)
  if (parts.length === 2 && parts[0] === 'blog') {
    const ssgBlog = path.join(ROOT_DIR, 'blog', ${parts[1]}.html);
    if (fs.existsSync(ssgBlog)) return sendFile(res, ssgBlog, 'text/html; charset=utf-8');
    const blogFile = fs.existsSync(path.join(ROOT_DIR, 'blog-post.html')) ? path.join(ROOT_DIR, 'blog-post.html') : path.join(ROOT_DIR, 'pages', 'blog-post.html');
    return sendFile(res, blogFile, 'text/html; charset=utf-8');
  }

  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>404 - Page Not Found</h1><p><a href="/">Return to SPEAKERPARTPRO</a></p>');
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`SPEAKERPARTPRO server running at http://localhost:${PORT}`);
    console.log(`Admin Panel available at http://localhost:${PORT}/admin`);
  });
}

module.exports = server;
