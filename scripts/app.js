// SPEAKERPARTPRO - Master App & Routing Engine (Light Industrial Aesthetic)

(function() {
  'use strict';

  // --- Currency Management ---
  const CURRENCIES = {
    USD: { symbol: '$', rate: 1, flag: '🇺🇸' },
    INR: { symbol: '₹', rate: 84.5, flag: '🇮🇳' },
    EUR: { symbol: '€', rate: 0.92, flag: '🇪🇺' },
    GBP: { symbol: '£', rate: 0.79, flag: '🇬🇧' }
  };

  let currentCurrency = localStorage.getItem('tspc_currency') || 'USD';
  if (!CURRENCIES[currentCurrency]) currentCurrency = 'USD';

  function formatPrice(usdPrice) {
    if (!usdPrice || isNaN(usdPrice)) return 'Inquire for B2B Pricing';
    const c = CURRENCIES[currentCurrency];
    const converted = (usdPrice * c.rate).toFixed(2);
    return `${c.symbol}${converted} ${currentCurrency}`;
  }

  // --- Cart / RFQ Inquiries Storage ---
  let rfqCart = [];
  try {
    rfqCart = JSON.parse(localStorage.getItem('tspc_rfq_cart') || '[]');
  } catch (e) {
    rfqCart = [];
  }

  function saveCart() {
    localStorage.setItem('tspc_rfq_cart', JSON.stringify(rfqCart));
    updateCartCount();
  }

  function addToCart(product, qty = 1) {
    const existing = rfqCart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      rfqCart.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.featured_image || '/assets/voice-coil-popout.png',
        price: product.variants && product.variants.price ? product.variants.price : null,
        moq: product.moq || '500 units',
        quantity: qty
      });
    }
    saveCart();
    renderCartDrawer();
    openCartDrawer();
  }

  function removeFromCart(id) {
    rfqCart = rfqCart.filter(item => item.id !== id);
    saveCart();
    renderCartDrawer();
  }

  function updateCartCount() {
    const countEls = document.querySelectorAll('.cart-badge-count');
    const total = rfqCart.reduce((sum, item) => sum + item.quantity, 0);
    countEls.forEach(el => {
      el.textContent = total;
      el.style.display = total > 0 ? 'inline-flex' : 'none';
    });
  }

    // --- Shared Header Render (Ultra-Sleek Single-Row Header) ---
  function renderHeader() {
    const headerEl = document.querySelector('header.site-header');
    if (!headerEl) return;

    const navLinks = [
      { name: 'Products', href: '/products.html' },
      { name: 'OEM Tooling', href: '/process.html' },
      { name: 'Engineering', href: '/about.html' },
      { name: 'Knowledge Hub', href: '/blog.html' },
      { name: 'Export', href: '/export.html' },
      { name: 'Track Order', href: '/track-shipment.html' },
      { name: 'Contact', href: '/contact.html' }
    ];

    const currentPath = window.location.pathname;

    headerEl.innerHTML = `
      <div class="container" style="padding-top: 0.35rem; padding-bottom: 0.35rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; min-height: 38px;">
          
          <!-- Left: Brand Logo -->
          <div style="flex-shrink: 0; display: flex; align-items: center;">
            <a href="/index.html" style="display: flex; align-items: center;" title="SPEAKERPARTPRO Homepage">
              <img src="/assets/speakerpartpro-horizontal-light.png??v=spp9" alt="SPEAKERPARTPRO" class="brand-logo-img" onerror="this.src='/assets/logo.png??v=spp9'">
            </a>
          </div>

          <!-- Center: Single-Row Horizontal Navigation -->
          <nav class="lg-nav-wrapper" style="display: none; align-items: center; gap: 0.25rem; flex-wrap: nowrap;">
            ${navLinks.map(l => {
              const isActive = currentPath.endsWith(l.href) || (l.href === '/products.html' && (currentPath === '/category.html' || currentPath === '/product-detail.html')) || (l.href === '/index.html' && (currentPath === '/' || currentPath === '/index.html'));
              return `<a class="nav-link ${isActive ? 'active' : ''}" href="${l.href}">${l.name}</a>`;
            }).join('')}
          </nav>

          <!-- Right: Search + Currency + RFQ Cart + Request Quote CTA -->
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
            
            <!-- Compact Desktop Search -->
            <form action="/products.html" method="GET" class="lg-search-form" style="display: none; width: 160px; margin: 0;">
              <div class="search-input-wrap" style="padding: 0.2rem 0.55rem; height: 30px; border-radius: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.35rem; color: #9CA3AF; flex-shrink: 0;">
                  <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type="text" name="q" placeholder="Search parts..." autocomplete="off" style="font-size: 11px;">
              </div>
            </form>

            <!-- Currency selector -->
            <div style="position: relative;">
              <select class="currency-selector" id="currencySwitcher" style="padding: 0.2rem 0.45rem; font-size: 11px; height: 30px; border-radius: 4px;">
                ${Object.keys(CURRENCIES).map(code => {
                  const c = CURRENCIES[code];
                  return `<option value="${code}" ${code === currentCurrency ? 'selected' : ''}>${c.flag} ${code} (${c.symbol})</option>`;
                }).join('')}
              </select>
            </div>

            <!-- RFQ Cart Button -->
            <button id="cartBtn" style="position: relative; background: #FFFFFF; border: 1px solid var(--border); border-radius: 4px; width: 32px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-primary); transition: all 0.2s; box-shadow: var(--shadow-xs);" title="View B2B RFQ Cart">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span class="cart-badge-count" style="position: absolute; top: -5px; right: -5px; background: var(--accent); color: #FFFFFF; font-size: 9px; font-weight: 800; width: 16px; height: 16px; border-radius: 50%; display: none; align-items: center; justify-content: center; box-shadow: 0 1px 6px var(--accent-glow);">0</span>
            </button>

            <!-- Prominent Orange CTA: Request B2B RFQ -->
            <button onclick="window.TSPC.openRfqModal()" class="btn-accent lg-quote-btn" style="display: none; height: 30px; padding: 0 0.85rem; font-size: 11px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; border-radius: 4px;">
              Request RFQ
            </button>

            <!-- Mobile Hamburger Button -->
            <button id="mobileMenuBtn" style="background: #FFFFFF; border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary); cursor: pointer; width: 32px; height: 30px; display: flex; align-items: center; justify-content: center;" class="mobile-only-btn" title="Toggle Menu">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>

        </div>
      </div>

      <!-- Mobile Search Form (compact) -->
      <div style="padding: 0.25rem 1rem 0.5rem; background: #FFFFFF; border-top: 1px solid var(--border);" class="mobile-search-wrapper">
        <form action="/products.html" method="GET">
          <div class="search-input-wrap" style="height: 28px; padding: 0.2rem 0.5rem;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.4rem; color: #9CA3AF;">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" name="q" placeholder="Search voice coils, cones, surrounds, spiders..." autocomplete="off" style="font-size: 11px;">
          </div>
        </form>
      </div>
    `;

    // Responsive styles for compact header
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @media (min-width: 1180px) {
        .lg-nav-wrapper { display: flex !important; }
        .lg-search-form { display: block !important; }
        .mobile-search-wrapper { display: none !important; }
        .mobile-only-btn { display: none !important; }
        .lg-quote-btn { display: inline-flex !important; }
      }
      @media (min-width: 960px) and (max-width: 1179px) {
        .lg-nav-wrapper { display: flex !important; }
        .lg-search-form { display: none !important; }
        .mobile-search-wrapper { display: none !important; }
        .mobile-only-btn { display: none !important; }
        .lg-quote-btn { display: inline-flex !important; }
      }
      @media (max-width: 959px) {
        .lg-nav-wrapper { display: none !important; }
        .lg-search-form { display: none !important; }
        .mobile-search-wrapper { display: block !important; }
        .mobile-only-btn { display: flex !important; }
      }
    `;
    document.head.appendChild(styleEl);

    // Currency Switcher Event
    const curSelect = document.getElementById('currencySwitcher');
    if (curSelect) {
      curSelect.addEventListener('change', (e) => {
        currentCurrency = e.target.value;
        localStorage.setItem('tspc_currency', currentCurrency);
        window.dispatchEvent(new CustomEvent('currencyChanged', { detail: currentCurrency }));
        document.querySelectorAll('[data-usd-price]').forEach(el => {
          const usd = parseFloat(el.getAttribute('data-usd-price'));
          el.textContent = formatPrice(usd);
        });
      });
    }

    // Cart Button Click
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
      cartBtn.addEventListener('click', openCartDrawer);
    }

    // Mobile Menu Button Click
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    updateCartCount();
  }

  // --- Shared Footer Render (Clean Light Industrial Footer) ---
  function renderFooter() {
    const footerEl = document.querySelector('footer.site-footer');
    if (!footerEl) return;

    footerEl.innerHTML = `
      <div class="container">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 2.5rem; margin-bottom: 3rem;">
          <!-- Column 1: Company Profile -->
          <div>
            <a href="/index.html" style="display: inline-block; margin-bottom: 1.25rem;">
              <img src="/assets/speakerpartpro-horizontal-light.png?????v=spp9" alt="SPEAKERPARTPRO" class="brand-logo-img" style="height: 44px; width: auto; object-fit: contain;">
            </a>
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 1.5rem;">
              <strong style="color: var(--text-primary);">SPEAKERPARTPRO</strong> is a premier manufacturer and global exporter of precision loudspeaker components, voice coils, surrounds, cones, spiders, and acoustic assemblies.
            </p>
            <div style="margin-bottom: 1rem;">
              <span style="display: block; font-family: var(--font-display); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-primary); margin-bottom: 0.75rem;">Quality & Standards:</span>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                <span style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 11px; background: #FFFFFF; border: 1px solid var(--border); color: var(--text-primary); padding: 0.3rem 0.65rem; border-radius: var(--radius-sm); box-shadow: var(--shadow-xs);">
                  <span style="color: var(--accent); font-weight: 700;">✓</span> ISO 9001:2015 CERTIFIED
                </span>
                <span style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 11px; background: #FFFFFF; border: 1px solid var(--border); color: var(--text-primary); padding: 0.3rem 0.65rem; border-radius: var(--radius-sm); box-shadow: var(--shadow-xs);">
                  <span style="color: var(--accent); font-weight: 700;">✓</span> GLOBAL EXPORT LICENSED
                </span>
              </div>
            </div>
          </div>

          <!-- Column 2: Component Categories -->
          <div>
            <h4 style="font-family: var(--font-display); font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-primary); margin-bottom: 1.25rem;">
              Acoustic Categories
            </h4>
            <div style="display: flex; flex-direction: column; gap: 0.65rem; font-size: 13px; color: var(--text-secondary);">
              <a href="/products.html?category=voice-coils" style="transition: color 0.2s;" onmouseover="this.style.color='#FF5A00'" onmouseout="this.style.color=''">High-Temp Voice Coils (TIL/Kapton)</a>
              <a href="/products.html?category=speaker-cones" style="transition: color 0.2s;" onmouseover="this.style.color='#FF5A00'" onmouseout="this.style.color=''">Air-Dried UKP Pulp Cones</a>
              <a href="/products.html?category=speaker-surrounds" style="transition: color 0.2s;" onmouseover="this.style.color='#FF5A00'" onmouseout="this.style.color=''">Extra-Thick SPL Foam Surrounds</a>
              <a href="/products.html?category=speaker-spiders" style="transition: color 0.2s;" onmouseover="this.style.color='#FF5A00'" onmouseout="this.style.color=''">Nomex Progressive Spiders</a>
              <a href="/products.html?category=dust-caps" style="transition: color 0.2s;" onmouseover="this.style.color='#FF5A00'" onmouseout="this.style.color=''">Carbon Fiber & Poly Dust Caps</a>
              <a href="/products.html?category=custom-recone-kits" style="transition: color 0.2s;" onmouseover="this.style.color='#FF5A00'" onmouseout="this.style.color=''">Custom Master Recone Kits</a>
            </div>
          </div>

          <!-- Column 3: Engineering & Export -->
          <div>
            <h4 style="font-family: var(--font-display); font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-primary); margin-bottom: 1.25rem;">
              OEM Capabilities & Logistics
            </h4>
            <div style="display: flex; flex-direction: column; gap: 0.65rem; font-size: 13px; color: var(--text-secondary);">
              <a href="/process.html" style="transition: color 0.2s;" onmouseover="this.style.color='#FF5A00'" onmouseout="this.style.color=''">Precision Tooling & Tolerances</a>
              <a href="/export.html" style="transition: color 0.2s;" onmouseover="this.style.color='#FF5A00'" onmouseout="this.style.color=''">Global Air & Ocean Freight</a>
              <a href="/track-shipment.html" style="transition: color 0.2s;" onmouseover="this.style.color='#FF5A00'" onmouseout="this.style.color=''">Live B2B Shipment Tracking</a>
              <a href="/gallery.html" style="transition: color 0.2s;" onmouseover="this.style.color='#FF5A00'" onmouseout="this.style.color=''">Factory Inspection Gallery</a>
              <a href="/blog.html" style="transition: color 0.2s;" onmouseover="this.style.color='#FF5A00'" onmouseout="this.style.color=''">Technical Knowledge Hub</a>
            </div>
          </div>

          <!-- Column 4: Factory Desk & B2B Inquiry -->
          <div>
            <h4 style="font-family: var(--font-display); font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-primary); margin-bottom: 1.25rem;">
              Global Sales Desk
            </h4>
            <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 13px; color: var(--text-secondary);">
              <div>
                <span style="color: var(--text-tertiary); display: block; font-size: 11px; text-transform: uppercase;">Headquarters:</span>
                <span style="color: var(--text-primary); font-weight: 500;">Jaipur, Rajasthan 302012, India</span>
              </div>
              <div>
                <span style="color: var(--text-tertiary); display: block; font-size: 11px; text-transform: uppercase;">WhatsApp / Direct:</span>
                <a href="https://wa.me/919214361550" style="color: var(--accent); font-weight: 700;">+91 92143 61550</a>
              </div>
              <div>
                <span style="color: var(--text-tertiary); display: block; font-size: 11px; text-transform: uppercase;">Export Inquiries:</span>
                <a href="mailto:sales@speakerpartpro.com" style="color: var(--text-primary); font-weight: 600;">sales@speakerpartpro.com</a>
              </div>
              <div style="margin-top: 0.5rem;">
                <button onclick="window.TSPC.openRfqModal()" class="btn-accent" style="width: 100%; font-size: 12px; padding: 0.6rem;">
                  Request B2B Proforma Quote
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Bottom Bar -->
        <div style="border-top: 1px solid var(--border); padding-top: 1.75rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; font-size: 12px; color: var(--text-tertiary);">
          <div>
            © 2026 <strong style="color: var(--text-primary);">SPEAKERPARTPRO</strong>. All Rights Reserved.
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: center;">
            <a href="/privacy.html" style="color: var(--text-secondary); transition: color 0.2s;" onmouseover="this.style.color='#FF5A00'" onmouseout="this.style.color=''">Privacy Policy</a>
            <a href="/terms.html" style="color: var(--text-secondary); transition: color 0.2s;" onmouseover="this.style.color='#FF5A00'" onmouseout="this.style.color=''">Terms of Service</a>
            <a href="/terms-of-supply.html" style="color: var(--text-secondary); transition: color 0.2s;" onmouseover="this.style.color='#FF5A00'" onmouseout="this.style.color=''">Terms of Supply</a>
            <a href="/admin.html" style="color: var(--text-secondary); transition: color 0.2s; display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 600;" onmouseover="this.style.color='#FF5A00'" onmouseout="this.style.color=''">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Admin Portal
            </a>
            <a href="https://mehrunidigital.vercel.app/" target="_blank" rel="noopener noreferrer" class="built-by-mhrn-link" title="Mhrn_ · websites, brands & the system underneath">
              <span class="built-by-label">BUILT BY</span>
              <span class="mhrn-logo-wrap">
                <span class="mhrn-text">Mhrn</span><span class="mhrn-bar"></span>
              </span>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // --- Floating RFQ Cart Drawer (Clean Light Aesthetic) ---
  function createCartDrawer() {
    if (document.getElementById('cartDrawer')) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'drawer-backdrop';
    backdrop.id = 'cartBackdrop';
    backdrop.addEventListener('click', closeCartDrawer);
    document.body.appendChild(backdrop);

    const drawer = document.createElement('div');
    drawer.className = 'drawer';
    drawer.id = 'cartDrawer';
    drawer.innerHTML = `
      <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: var(--bg-secondary);">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <h3 style="font-family: var(--font-display); font-size: 16px; font-weight: 800; text-transform: uppercase; color: var(--text-primary);">
            B2B RFQ Inquiry Cart
          </h3>
          <span class="cart-badge-count" style="background: var(--accent); color: #FFFFFF; font-size: 10px; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px;">0</span>
        </div>
        <button id="closeCartBtn" style="background: transparent; border: none; color: var(--text-secondary); font-size: 20px; cursor: pointer; padding: 0.25rem;" title="Close">✕</button>
      </div>

      <div id="cartItemsList" style="flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
        <!-- Dynamic Cart Items Rendered Here -->
      </div>

      <div style="padding: 1.25rem 1.5rem; border-top: 1px solid var(--border); background: var(--bg-secondary);">
        <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.5;">
          Direct wholesale inquiry transmitted to master manufacturing team. You will receive an official Proforma Invoice with container freight options.
        </p>
        <button onclick="window.TSPC.openRfqModal()" class="btn-accent" style="width: 100%; padding: 0.85rem; font-size: 13px;">
          PROCEED TO B2B RFQ QUOTE
        </button>
      </div>
    `;

    document.body.appendChild(drawer);
    document.getElementById('closeCartBtn').addEventListener('click', closeCartDrawer);
  }

  function renderCartDrawer() {
    const list = document.getElementById('cartItemsList');
    if (!list) return;

    if (rfqCart.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-tertiary);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 1rem; opacity: 0.4;">
            <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <p style="font-weight: 700; color: var(--text-primary);">Your inquiry list is empty</p>
          <p style="font-size: 12px; margin-top: 0.5rem;">Browse the SPEAKERPARTPRO catalog and add components to request evaluation samples or production quotation.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = rfqCart.map(item => `
      <div style="display: flex; gap: 0.75rem; background: #FFFFFF; border: 1px solid var(--border); border-radius: var(--radius); padding: 0.75rem; align-items: center; box-shadow: var(--shadow-xs);">
        <img src="${item.image}" alt="${item.name}" style="width: 54px; height: 54px; object-fit: contain; background: #F9FAFB; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 4px;">
        <div style="flex: 1; min-width: 0;">
          <h4 style="font-size: 12px; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</h4>
          <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">MOQ: ${item.moq}</div>
          <div style="font-family: var(--font-mono); font-size: 12px; color: var(--accent); font-weight: 700; margin-top: 2px;">
            ${item.price ? formatPrice(item.price) : 'B2B RFQ'}
          </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem;">
          <button onclick="window.TSPC.removeFromCart('${item.id}')" style="background: transparent; border: none; color: var(--text-tertiary); cursor: pointer; font-size: 14px;" title="Remove">✕</button>
          <div style="display: flex; align-items: center; border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden;">
            <button onclick="window.TSPC.changeQty('${item.id}', -1)" style="background: var(--bg-secondary); border: none; color: var(--text-primary); width: 22px; height: 22px; cursor: pointer; font-weight: 700;">-</button>
            <span style="font-size: 11px; padding: 0 6px; color: var(--text-primary); font-weight: 600;">${item.quantity}</span>
            <button onclick="window.TSPC.changeQty('${item.id}', 1)" style="background: var(--bg-secondary); border: none; color: var(--text-primary); width: 22px; height: 22px; cursor: pointer; font-weight: 700;">+</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function openCartDrawer() {
    createCartDrawer();
    renderCartDrawer();
    document.getElementById('cartDrawer').classList.add('open');
    document.getElementById('cartBackdrop').classList.add('open');
  }

  function closeCartDrawer() {
    const d = document.getElementById('cartDrawer');
    const b = document.getElementById('cartBackdrop');
    if (d) d.classList.remove('open');
    if (b) b.classList.remove('open');
  }

  // --- RFQ Quote Modal Component ---
  function createRfqModal() {
    if (document.getElementById('rfqModal')) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'rfqModal';
    modal.innerHTML = `
      <div class="modal-container">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
          <h3 style="font-family: var(--font-display); font-size: 18px; font-weight: 800; text-transform: uppercase; color: var(--text-primary);">
            Request Official SPEAKERPARTPRO Quotation
          </h3>
          <button id="closeRfqModalBtn" style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; font-size: 20px;">✕</button>
        </div>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.6;">
          Direct quotation from master manufacturer SPEAKERPARTPRO (Jaipur, India). We provide custom OEM tooling, evaluation samples, and global container shipping.
        </p>
        <form id="rfqForm">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input type="text" id="rfqName" required class="form-control" placeholder="John Doe">
            </div>
            <div class="form-group">
              <label class="form-label">Company / Brand *</label>
              <input type="text" id="rfqCompany" required class="form-control" placeholder="Pro Audio LLC">
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Business Email *</label>
              <input type="email" id="rfqEmail" required class="form-control" placeholder="purchasing@company.com">
            </div>
            <div class="form-group">
              <label class="form-label">WhatsApp / Phone *</label>
              <input type="tel" id="rfqPhone" required class="form-control" placeholder="+1 (555) 000-0000">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Destination Country & Port *</label>
            <input type="text" id="rfqCountry" required class="form-control" placeholder="United States (DHL Express / Long Beach Port)">
          </div>
          <div class="form-group">
            <label class="form-label">Inquiry Details / Specific Dimensions</label>
            <textarea id="rfqDetails" rows="3" class="form-control" placeholder="Specify required voice coil diameters, cone depths, surround materials, or target annual quantities..."></textarea>
          </div>
          <button type="submit" id="rfqSubmitBtn" class="btn-accent" style="width: 100%; padding: 0.85rem; font-size: 13px; margin-top: 0.5rem;">
            SUBMIT B2B QUOTATION REQUEST
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('closeRfqModalBtn').addEventListener('click', closeRfqModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeRfqModal();
    });

    document.getElementById('rfqForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('rfqSubmitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'TRANSMITTING INQUIRY...';
      }

      const payload = {
        name: document.getElementById('rfqName')?.value || '',
        company: document.getElementById('rfqCompany')?.value || '',
        email: document.getElementById('rfqEmail')?.value || '',
        phone: document.getElementById('rfqPhone')?.value || '',
        country: document.getElementById('rfqCountry')?.value || '',
        message: document.getElementById('rfqDetails')?.value || '',
        items: rfqCart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          category: item.category
        }))
      };

      try {
        const res = await fetch('/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data && data.success) {
          alert(`Thank you! Your quotation request (${data.inquiry.id}) has been recorded at the SPEAKERPARTPRO B2B Sales Desk. A technical export representative will contact you with Proforma pricing within 24 hours.`);
        } else {
          alert('Thank you! Your quotation request has been transmitted to SPEAKERPARTPRO B2B Sales Desk.');
        }
      } catch (err) {
        alert('Thank you! Your quotation request has been transmitted to SPEAKERPARTPRO B2B Sales Desk.');
      }

      closeRfqModal();
      rfqCart = [];
      saveCart();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'SUBMIT B2B QUOTATION REQUEST';
      }
    });
  }

  function openRfqModal() {
    createRfqModal();
    document.getElementById('rfqModal').classList.add('active');
  }

  function closeRfqModal() {
    const m = document.getElementById('rfqModal');
    if (m) m.classList.remove('active');
  }

  // --- Mobile Navigation Drawer (Clean Light Aesthetic) ---
  function toggleMobileMenu() {
    let menu = document.getElementById('mobileNavDrawer');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'mobileNavDrawer';
      menu.className = 'drawer';
      menu.innerHTML = `
        <div style="padding: 1.25rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: var(--bg-secondary);">
          <img src="/assets/speakerpartpro-horizontal-light.png??v=spp9" alt="SPEAKERPARTPRO" style="height: 38px; width: auto; object-fit: contain;">
          <button id="closeMobileNavBtn" style="background: transparent; border: none; color: var(--text-secondary); font-size: 20px; cursor: pointer;">✕</button>
        </div>
        <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; font-family: var(--font-display); font-size: 15px; font-weight: 700; text-transform: uppercase;">
          <a href="/index.html" style="color: var(--text-primary);">Home</a>
          <a href="/products.html" style="color: var(--text-primary);">Products Catalog</a>
          <a href="/process.html" style="color: var(--text-primary);">OEM Manufacturing</a>
          <a href="/about.html" style="color: var(--text-primary);">Corporate Profile</a>
          <a href="/export.html" style="color: var(--text-primary);">Export & Logistics</a>
          <a href="/gallery.html" style="color: var(--text-primary);">Product Gallery</a>
          <a href="/track-shipment.html" style="color: var(--text-primary);">Track Shipment</a>
          <a href="/blog.html" style="color: var(--text-primary);">Knowledge Hub</a>
          <a href="/contact.html" style="color: var(--text-primary);">Contact Us</a>
        </div>
        <div style="margin-top: auto; padding: 1.5rem; border-top: 1px solid var(--border); background: var(--bg-secondary);">
          <a href="https://wa.me/919214361550" target="_blank" rel="noopener noreferrer" style="display: block; margin-bottom: 0.75rem;">
            <button class="btn-whatsapp" style="width: 100%; justify-content: center;">
              <img src="/assets/whatsapp.png" alt="WhatsApp" style="width: 16px; height: 16px;">
              Chat on WhatsApp
            </button>
          </a>
          <button onclick="window.TSPC.openRfqModal()" class="btn-accent" style="width: 100%; justify-content: center;">
            Request Quote
          </button>
        </div>
      `;
      document.body.appendChild(menu);
      document.getElementById('closeMobileNavBtn').addEventListener('click', () => {
        menu.classList.remove('open');
      });
    }
    menu.classList.toggle('open');
  }

  // --- Initialize on Page Load ---
  document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    renderFooter();
    createCartDrawer();
  });

  // Global Export API
  window.TSPC = {
    addToCart,
    removeFromCart,
    changeQty: (id, delta) => {
      const item = rfqCart.find(i => i.id === id);
      if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) removeFromCart(id);
        else {
          saveCart();
          renderCartDrawer();
        }
      }
    },
    formatPrice,
    openCartDrawer,
    closeCartDrawer,
    openRfqModal,
    closeRfqModal,
    toggleMobileMenu
  };
})();
