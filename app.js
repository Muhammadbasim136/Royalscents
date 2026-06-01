// ── EmailJS Init ──
  emailjs.init('WIAsRGIw-sjOGZA5X');

  // ── DATA ──
  const products = [
    { id: 1, name: 'Veloura BLOOM', sub: 'Eau de Parfum · 50ml', originalPrice: 2499, price: 1499, badge: 'BESTSELLER', img: 'product1.jpg' },
    { id: 2, name: 'Veloura KNIGHT', sub: 'Eau de Parfum · 50ml', originalPrice: 2499, price: 1499, badge: 'NEW', img: 'product2.jpg' },
    { id: 3, name: 'BRUT CLASSIC', sub: 'Eau de Parfum · 50ml', originalPrice: 2499, price: 1499, badge: 'NEW', img: 'product..webp' },
    { id: 5, name: 'THE SCULPTOR NOIR', sub: 'Eau de Parfum · 50ml', originalPrice: 2499, price: 1499, badge: 'NEW', img: 'product5.jpg' },
    { id: 6, name: 'CROWN ELIXORA', sub: 'Eau de Parfum · 50ml', originalPrice: 2499, price: 1499, badge: 'NEW', img: 'product6.jpg' },
    { id: 7, name: 'Vanilla Dew', sub: 'Eau de Parfum · 50ml', originalPrice: 2499, price: 1499, badge: 'NEW', img: 'product7.jpg' },
  ];

  const deals = [
    { id: 4, name: 'THE LEGENDARY BOX', sub: 'perfume · 2 x 50ml', originalPrice: 4999, price: 2699, badge: 'DEAL', img: 'product3.jpg' },
  ];

  let cart = [];
  let voucherApplied = false;
  let voucherDiscount = 0;
  let selectedPayment = '';
  let currentSlide = 0;

  // ── SVG PLACEHOLDER ──
  const bottleSVG = `<svg viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg" width="56" height="84">
    <rect x="28" y="2" width="24" height="10" rx="2" fill="rgba(201,168,76,0.2)" stroke="rgba(201,168,76,0.4)" stroke-width="1"/>
    <rect x="34" y="12" width="12" height="8" rx="1" fill="rgba(201,168,76,0.15)" stroke="rgba(201,168,76,0.3)" stroke-width="1"/>
    <rect x="20" y="20" width="40" height="70" rx="6" fill="rgba(201,168,76,0.08)" stroke="rgba(201,168,76,0.35)" stroke-width="1.5"/>
    <rect x="24" y="30" width="32" height="50" rx="4" fill="rgba(201,168,76,0.06)"/>
    <text x="40" y="60" text-anchor="middle" font-size="7" fill="rgba(201,168,76,0.5)" font-family="serif" font-style="italic">Royal</text>
    <text x="40" y="72" text-anchor="middle" font-size="6" fill="rgba(201,168,76,0.35)" font-family="serif">Scent</text>
  </svg>`;

  // ── RENDER CARDS ──
  function renderCard(p) {
    return `<div class="product-card">
      <div class="product-img-wrap" style="${p.wide ? 'aspect-ratio:4/3;' : 'aspect-ratio:3/4;'}">
        <div class="product-img-placeholder">
          ${p.img ? `<img src="./${p.img}" alt="${p.name}"
            loading="lazy"
            decoding="async"
            style="width:100%;height:100%;object-fit:${p.wide ? 'contain' : 'cover'};background:#0a0a0a;"
            onerror="this.style.display='none'" />` : bottleSVG}
        </div>
        ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-sub">${p.sub}</div>
        <div class="price-wrap">
          <span class="price-old">Rs ${p.originalPrice.toLocaleString()}</span>
          <span class="price-new">Rs ${p.price.toLocaleString()}</span>
        </div>
        <button class="add-btn" onclick="addToCart(${p.id})">Add to Cart</button>
      </div>
    </div>`;
  }

  document.getElementById('productsGrid').innerHTML = products.map(renderCard).join('');
  document.getElementById('dealsGrid').innerHTML = deals.map(renderCard).join('');

  // ── CART LOGIC ──
  function allProducts() { return [...products, ...deals]; }

  function addToCart(id) {
    const product = allProducts().find(p => p.id === id);
    const existing = cart.find(c => c.id === id);
    if (existing) existing.qty++;
    else cart.push({ ...product, qty: 1 });
    updateCartUI();
    showToast('Added to cart — ' + product.name);
  }

  function removeFromCart(id) {
    cart = cart.filter(c => c.id !== id);
    updateCartUI();
  }

  function changeQty(id, delta) {
    const item = cart.find(c => c.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
    updateCartUI();
  }

  function updateCartUI() {
    const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const cartCount = cart.reduce((s, c) => s + c.qty, 0);
    document.getElementById('cartCount').textContent = cartCount;

    const itemsEl = document.getElementById('cartItems');
    const emptyEl = document.getElementById('cartEmpty');

    if (cart.length === 0) {
      emptyEl.style.display = 'flex';
      document.querySelectorAll('.cart-item').forEach(el => el.remove());
      const progressEl = document.getElementById('deliveryProgress');
      if (progressEl) progressEl.style.display = 'none';
      voucherApplied = false;
      voucherDiscount = 0;
      document.getElementById('voucherInput').value = '';
      document.getElementById('voucherMsg').textContent = '';
      document.getElementById('voucherMsg').className = 'voucher-msg';
    } else {
      emptyEl.style.display = 'none';
      document.querySelectorAll('.cart-item').forEach(el => el.remove());
      cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
          <div class="cart-item-img" style="overflow:hidden; border-radius:2px; width:70px; height:70px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:#1a1a1a; border:1px solid rgba(201,168,76,0.2);">
            ${item.img ? `<img src="./${item.img}" alt="${item.name}" loading="lazy" style="overflow:hidden; border-radius:2px; width:90px; height:70px;" onerror="this.style.display='none'" />` : `<svg viewBox="0 0 80 120" fill="none" width="28" height="42"><rect x="28" y="2" width="24" height="10" rx="2" fill="rgba(201,168,76,0.2)" stroke="rgba(201,168,76,0.4)" stroke-width="1.5"/><rect x="20" y="20" width="40" height="70" rx="6" fill="rgba(201,168,76,0.08)" stroke="rgba(201,168,76,0.35)" stroke-width="1.5"/></svg>`}
          </div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">Rs ${(item.price * item.qty).toLocaleString()}</div>
            <div class="qty-control">
              <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
            </div>
          </div>
          <button class="remove-btn" onclick="removeFromCart(${item.id})">✕</button>
        `;
        itemsEl.insertBefore(div, emptyEl);
      });

      const remaining = Math.max(0, 3000 - total);
      const progressEl = document.getElementById('deliveryProgress');
      const progressMsgEl = document.getElementById('deliveryProgressMsg');
      const progressBarEl = document.getElementById('deliveryProgressBar');
      if (progressEl) {
        progressEl.style.display = 'block';
        if (total >= 3000) {
          progressMsgEl.innerHTML = '🎉 <span style="color:#4caf50">You got Free Delivery!</span>';
          progressBarEl.style.width = '100%';
          progressBarEl.style.background = '#4caf50';
        } else {
          progressMsgEl.innerHTML = `🚚 Add <strong style="color:var(--gold)">Rs ${remaining.toLocaleString()}</strong> more for Free Delivery`;
          progressBarEl.style.width = Math.min((total / 3000) * 100, 100) + '%';
          progressBarEl.style.background = 'var(--gold)';
        }
      }
    }

    if (voucherApplied && total < 3000) {
      voucherApplied = false;
      voucherDiscount = 0;
      document.getElementById('voucherInput').value = '';
      document.getElementById('voucherMsg').textContent = '✗ Voucher removed — minimum Rs 3,000 required.';
      document.getElementById('voucherMsg').className = 'voucher-msg error';
    }

    const freeDelivery = total >= 3000;
    const discount = (voucherApplied && total >= 3000) ? Math.round(total * voucherDiscount / 100) : 0;
    const labelEl = document.getElementById('discountLabel');
    if (labelEl) labelEl.textContent = 'Voucher (' + voucherDiscount + '%)';
    const delivery = cart.length === 0 ? 0 : (freeDelivery ? 0 : 300);
    const grandTotal = total - discount + delivery;

    document.getElementById('subtotalVal').textContent = 'Rs ' + total.toLocaleString();
    document.getElementById('discountRow').style.display = (voucherApplied && total >= 3000) ? 'flex' : 'none';
    document.getElementById('discountVal').textContent = '− Rs ' + discount.toLocaleString();
    document.getElementById('deliveryVal').innerHTML = cart.length === 0
      ? 'Rs 0'
      : freeDelivery
        ? '<span class="free-badge">FREE</span>'
        : 'Rs 300';
    document.getElementById('totalVal').textContent = 'Rs ' + grandTotal.toLocaleString();
  }

  function applyVoucher() {
    const code = document.getElementById('voucherInput').value.trim().toUpperCase();
    const msgEl = document.getElementById('voucherMsg');
    const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const vouchers = { 'ROYAL10': 10, 'ROYAL20': 20 };

    if (vouchers[code]) {
      if (total < 3000) {
        msgEl.textContent = '✗ Minimum Rs 3,000 ka order chahiye voucher apply karne ke liye.';
        msgEl.className = 'voucher-msg error';
        return;
      }
      voucherApplied = true;
      voucherDiscount = vouchers[code];
      msgEl.textContent = '✓ Voucher applied! ' + vouchers[code] + '% discount activated.';
      msgEl.className = 'voucher-msg success';
      updateCartUI();
    } else {
      msgEl.textContent = '✗ Invalid voucher code.';
      msgEl.className = 'voucher-msg error';
    }
  }

  // ── CART OPEN/CLOSE ──
  function openCart() {
    document.getElementById('cartSidebar').classList.add('open');
    document.getElementById('cartOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  // ── CHECKOUT ──
  function openCheckout() {
    if (cart.length === 0) { showToast('Your cart is empty!'); return; }
    closeCart();
    document.getElementById('checkoutModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('open');
    document.body.style.overflow = '';
  }

  function selectPayment(method) {
    selectedPayment = method;
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    document.getElementById('payOptCOD').classList.add('selected');
    document.getElementById('radioCOD').checked = true;
  }

  function getOrderData() {
    const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const freeDelivery = subtotal >= 3000;
    const discount = voucherApplied ? Math.round(subtotal * voucherDiscount / 100) : 0;
    const delivery = freeDelivery ? 0 : 300;
    const total = subtotal - discount + delivery;
    const items = cart.map(c => `${c.name} x${c.qty} = Rs ${(c.price * c.qty).toLocaleString()}`).join('\n');
    return { subtotal, discount, delivery, total, items };
  }

  async function submitOrder() {
    const name = document.getElementById('custName').value.trim();
    const email = document.getElementById('custEmail').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const area = document.getElementById('custArea').value;
    const address = document.getElementById('custAddress').value.trim();

    document.querySelectorAll('.field-error').forEach(el => el.remove());
    let hasError = false;

    function showFieldError(id, msg) {
      const input = document.getElementById(id);
      if (!input) return;
      const err = document.createElement('div');
      err.className = 'field-error';
      err.style.cssText = 'color:#e55; font-size:0.75rem; margin-top:4px;';
      err.textContent = '⚠ ' + msg;
      input.parentNode.appendChild(err);
      input.style.borderColor = '#e55';
      hasError = true;
    }

    function showPhoneError(msg) {
      const phoneWrap = document.getElementById('custPhone').closest('.phone-wrap');
      const err = document.createElement('div');
      err.className = 'field-error';
      err.style.cssText = 'color:#e55; font-size:0.75rem; margin-top:4px;';
      err.textContent = '⚠ ' + msg;
      phoneWrap.parentNode.insertBefore(err, phoneWrap.nextSibling);
      document.getElementById('custPhone').style.borderColor = '#e55';
      hasError = true;
    }

    if (!name) showFieldError('custName', 'Please enter your full name');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      showFieldError('custEmail', 'Please enter your email address');
    } else if (!emailRegex.test(email)) {
      showFieldError('custEmail', 'please enter a valid email address');
    }

    const phoneRegex = /^3\d{9}$/;
    if (!phone) {
      showPhoneError('Please enter your phone number');
    } else if (!phoneRegex.test(phone)) {
      showPhoneError('please enter 10-digits phone number like +92xxxxxxxxxx');
    }

    if (!area) showFieldError('custArea', 'Please select your area');
    if (!address) showFieldError('custAddress', 'Please enter your full address');

    if (!selectedPayment) {
      const payEl = document.querySelector('.payment-options');
      const err = document.createElement('div');
      err.className = 'field-error';
      err.style.cssText = 'color:#e55; font-size:0.75rem; margin-top:4px;';
      err.textContent = '⚠ Please select a payment method';
      payEl.parentNode.appendChild(err);
      hasError = true;
    }

    if (hasError) {
      showToast('Please fill all required fields');
      return;
    }

    ['custName','custEmail','custPhone','custArea','custAddress'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.borderColor = '';
    });

    const btn = document.getElementById('submitBtn');
    btn.textContent = 'Processing...'; btn.disabled = true;

    const zip = document.getElementById('custZip').value.trim();
    const od = getOrderData();

    const templateParams = {
      customer_name: name,
      customer_email: email,
      customer_phone: '+92' + phone,
      customer_area: area,
      customer_address: address,
      customer_zipcode: zip || 'N/A',
      payment_method: selectedPayment,
      order_items: od.items,
      subtotal: 'Rs ' + od.subtotal.toLocaleString(),
      voucher_discount: od.discount > 0 ? 'Rs ' + od.discount.toLocaleString() : 'None',
      delivery_fee: od.delivery === 0 ? 'FREE' : 'Rs 300',
      total: 'Rs ' + od.total.toLocaleString(),
    };

    try {
      await emailjs.send('service_mnvfrle', 'template_abx5x0y', templateParams);
    } catch(e) { console.warn('EmailJS:', e); }

    try {
      await fetch('https://script.google.com/macros/s/AKfycbzqfNkkR7slzDuD9XYFvXVoJWmQZFpBpMSHNcpGSwdjYx465o_tTi0vRJOF2NcE6nI6/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone: '+92' + phone, area, address, zipcode: zip,
          payment_method: selectedPayment,
          items: od.items, subtotal: od.subtotal,
          discount: od.discount, delivery: od.delivery, total: od.total,
        }),
      });
    } catch(e) { console.warn('Sheets:', e); }

    btn.textContent = 'Confirm Order'; btn.disabled = false;
    closeCheckout();
    showSuccess({ name, email, phone: '+92' + phone, area, address, payment: selectedPayment, ...od });
    cart = []; voucherApplied = false;
    document.getElementById('voucherInput').value = '';
    document.getElementById('voucherMsg').textContent = '';
    updateCartUI();
  }

  // ── SUCCESS ──
  function showSuccess(data) {
    const box = document.getElementById('orderSummaryBox');
    box.innerHTML = `
      <h4>Order Summary</h4>
      <div class="summary-row"><span>Name</span><span>${data.name}</span></div>
      <div class="summary-row"><span>Phone</span><span>${data.phone}</span></div>
      <div class="summary-row"><span>Area</span><span>${data.area}, Karachi</span></div>
      <div class="summary-row"><span>Address</span><span>${data.address}</span></div>
      <div class="summary-row"><span>Payment</span><span>${data.payment}</span></div>
      <div class="summary-row"><span>Subtotal</span><span>Rs ${data.subtotal.toLocaleString()}</span></div>
      ${data.discount > 0 ? `<div class="summary-row"><span>Discount (${voucherDiscount}%)</span><span>−Rs ${data.discount.toLocaleString()}</span></div>` : ''}
      <div class="summary-row"><span>Delivery</span><span>${data.delivery === 0 ? 'FREE' : 'Rs 300'}</span></div>
      <div class="summary-row" style="font-weight:600;"><span>Total</span><span>Rs ${data.total.toLocaleString()}</span></div>
    `;
    document.getElementById('successOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSuccess() {
    document.getElementById('successOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  // ── TOAST ──
  function showToast(msg) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>${msg}`;
    container.appendChild(toast);
    requestAnimationFrame(() => { requestAnimationFrame(() => toast.classList.add('show')); });
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  // ── HERO SLIDER ──
  const slides = document.querySelectorAll('.slide');

  function goToSlide(n) {
    slides[currentSlide].classList.remove('active');
    currentSlide = n;
    slides[currentSlide].classList.add('active');
    const slide2 = document.getElementById('slide2');
    if (!slide2.dataset.loaded) {
      slide2.style.backgroundImage = "url('./slide 2.png')";
      slide2.dataset.loaded = 'true';
    }
  }

  const slideTimes = [4000, 2000];
  function startSlideTimer() {
    setTimeout(() => {
      goToSlide((currentSlide + 1) % slides.length);
      startSlideTimer();
    }, slideTimes[currentSlide]);
  }
  startSlideTimer();

  updateCartUI();
  selectPayment('COD');

  // ── PRODUCTS SCROLL ──
  const productsWrap = document.getElementById('productsWrap');
  const cardWidth = window.innerWidth <= 600 ? 220 + 14 : window.innerWidth <= 900 ? 260 + 24 : 280 + 24;

  function scrollProducts(dir) {
    productsWrap.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
    setTimeout(updateArrows, 400);
  }

  function updateArrows() {
    const leftBtn = document.querySelector('.scroll-arrow-left');
    const rightBtn = document.querySelector('.scroll-arrow-right');
    const scrollLeft = productsWrap.scrollLeft;
    const maxScroll = productsWrap.scrollWidth - productsWrap.clientWidth;

    leftBtn.style.opacity = scrollLeft <= 10 ? '0' : '1';
    leftBtn.style.pointerEvents = scrollLeft <= 10 ? 'none' : 'auto';

    rightBtn.style.opacity = scrollLeft >= maxScroll - 10 ? '0' : '1';
    rightBtn.style.pointerEvents = scrollLeft >= maxScroll - 10 ? 'none' : 'auto';
  }

  productsWrap.addEventListener('scroll', updateArrows);
  updateArrows();

  // ── MOUSE DRAG SCROLL ──
  let isDown = false, startX, scrollStart;
  productsWrap.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - productsWrap.offsetLeft;
    scrollStart = productsWrap.scrollLeft;
  });
  productsWrap.addEventListener('mouseleave', () => isDown = false);
  productsWrap.addEventListener('mouseup', () => isDown = false);
  productsWrap.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - productsWrap.offsetLeft;
    productsWrap.scrollLeft = scrollStart - (x - startX);
  });