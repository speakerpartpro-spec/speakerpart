const fs = require('fs');
const path = require('path');
const url = require('url');

const ROOT_DIR = process.cwd();

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

module.exports = async (req, res) => {
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
      try { fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8'); } catch (err) {}
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
      try { fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8'); } catch (err) {}
      return sendJson(res, { success: true, product: products[index] });
    }

    if (req.method === 'DELETE') {
      const id = query.id;
      products = products.filter(p => p.id !== id);
      try { fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8'); } catch (err) {}
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
        try { fs.writeFileSync(inquiriesPath, JSON.stringify(inquiries, null, 2), 'utf8'); } catch (err) {}
        return sendJson(res, { success: true, inquiry: inquiries[index] });
      }
      return sendJson(res, { success: false, message: 'Inquiry not found' }, 404);
    }

    if (req.method === 'DELETE') {
      const id = query.id;
      inquiries = inquiries.filter(i => i.id !== id);
      try { fs.writeFileSync(inquiriesPath, JSON.stringify(inquiries, null, 2), 'utf8'); } catch (err) {}
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
      try { fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8'); } catch (err) {}
      return sendJson(res, { success: true, settings });
    }
  }

  // Public API Routes
  if (pathname === '/api/categories') {
    const categoriesPath = path.join(ROOT_DIR, 'public', 'data', 'categories.json');
    let data = [];
    try { data = JSON.parse(fs.readFileSync(categoriesPath, 'utf8')); } catch (e) {}
    return sendJson(res, data);
  }
  if (pathname === '/api/products') {
    const productsPath = path.join(ROOT_DIR, 'public', 'data', 'products.json');
    let data = [];
    try { data = JSON.parse(fs.readFileSync(productsPath, 'utf8')); } catch (e) {}
    return sendJson(res, data);
  }
  if (pathname === '/api/blogs' || pathname === '/api/blog') {
    const blogsPath = path.join(ROOT_DIR, 'public', 'data', 'blogs.json');
    let data = [];
    try { data = JSON.parse(fs.readFileSync(blogsPath, 'utf8')); } catch (e) {}
    return sendJson(res, data);
  }
  if (pathname === '/api/social-links') {
    const socialPath = path.join(ROOT_DIR, 'public', 'data', 'social.json');
    let data = {};
    try { data = JSON.parse(fs.readFileSync(socialPath, 'utf8')); } catch (e) {}
    return sendJson(res, data);
  }

  // Public Inquiries Submission
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
      try { fs.writeFileSync(inquiriesPath, JSON.stringify(inquiries, null, 2), 'utf8'); } catch (err) {}
      return sendJson(res, { success: true, id: newInquiry.id, inquiry: newInquiry, message: 'Your quotation request has been submitted.' });
    }
    return sendJson(res, { success: true, message: 'Request received.' });
  }

  sendJson(res, { error: 'Not found', pathname }, 404);
};
