const PRODUCTS = [
  {
    id: 1,
    name: "Anarkali",
    price: 999,
    image:
      "ClothingWeb/image/anarkali1.jpg",
    description:
      "Fluid satin with a gentle glow, designed to move like light. Statement shoulders and a modern drape keep it timeless.",
    category: "Dresses",
  },
  {
    id: 2,
    name: "Tshirt1",
    price: 499,
    image:
      "ClothingWeb/image/tshirt1.jpg",
    description:
      "Sharp lines, soft structure. This tshirt layers effortlessly with tonal basics and elevated silhouettes.",
    category: "Outerwear",
  },
  {
    id: 3,
    name: "Tshirt2",
    price: 599,
    image:
      "ClothingWeb/image/tshirt2.jpg",
    description:
      "A cloud-soft knit co-ord in a pastel hue. Pair together or style separately for capsule versatility.",
    category: "Sets",
  },
  {
    id: 4,
    name: "Sandstone Utility Skirt",
    price: 89,
    image:
      "ClothingWeb/image/anarkali1.jpg",
    description:
      "A minimalist utility skirt with sculpted pockets and a soft matte finish. Made for all-day wear.",
    category: "Skirts",
  },
  {
    id: 5,
    name: "Luna Sheer Blouse",
    price: 74,
    image:
      "ClothingWeb/image/tshirt1.jpg",
    description:
      "Lightweight sheer fabric with delicate pleats. Layer over bralettes or tanks for evening energy.",
    category: "Tops",
  },
  {
    id: 6,
    name: "Velvet Daydream Pants",
    price: 118,
    image:
      "ClothingWeb/image/tshirt2.jpg",
    description:
      "Velvet-wide leg pants with a high-rise waistline. Luxe texture meets everyday ease.",
    category: "Bottoms",
  },
];

const CART_KEY = "reindeer-cart";

const createPlaceholder = (label) => {
  const safeLabel = encodeURIComponent(label);
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><rect width='100%' height='100%' fill='%23f5efe6'/><text x='50%' y='50%' font-family='Poppins, sans-serif' font-size='28' fill='%236b6b6b' text-anchor='middle' dominant-baseline='middle'>${safeLabel}</text></svg>`;
};

const applyImageFallbacks = () => {
  document.querySelectorAll("img[data-product]").forEach((img) => {
    if (img.dataset.fallbackBound) return;
    img.dataset.fallbackBound = "true";
    img.addEventListener("error", () => {
      img.src = createPlaceholder(img.dataset.product || "Image unavailable");
    });
    if (img.dataset.src && !img.dataset.loaded) {
      img.dataset.loaded = "true";
      img.src = img.dataset.src;
    }
  });
};

const getCart = () => {
  const stored = localStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

const updateCartCount = () => {
  const cartCountEl = document.querySelector(".cart-count");
  if (!cartCountEl) return;
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountEl.textContent = count;
};

const addToCart = (productId, quantity = 1, size = "M") => {
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId && item.size === size);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id: productId, quantity, size });
  }
  saveCart(cart);
  updateCartCount();
};

const buyNow = (productId, quantity = 1, size = "M") => {
  saveCart([{ id: productId, quantity, size }]);
  updateCartCount();
  window.location.href = "payment.html";
};

const formatPrice = (value) => `$${value.toFixed(2)}`;

const renderProducts = (containerId, limit) => {
  const container = document.getElementById(containerId);
  if (!container) return;
  const list = limit ? PRODUCTS.slice(0, limit) : PRODUCTS;
  container.innerHTML = list
    .map(
      (product) => `
      <article class="product-card reveal">
        <div class="product-image">
          <img
            src="${createPlaceholder(product.name)}"
            data-src="${product.image}"
            alt="${product.name}"
            loading="lazy"
            data-product="${product.name}"
          />
        </div>
        <div class="product-info">
          <span>${product.category}</span>
          <h3>${product.name}</h3>
          <span class="price">${formatPrice(product.price)}</span>
          <div class="product-actions">
            <button class="view-btn ripple" data-id="${product.id}">View Details</button>
            <button class="cart-btn ripple" data-add="${product.id}">Add to Cart</button>
            <button class="buy-btn ripple" data-buy="${product.id}">Buy Now</button>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  container.querySelectorAll("[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = `product.html?id=${btn.dataset.id}`;
    });
  });

  container.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart(Number(btn.dataset.add), 1, "M");
    });
  });

  container.querySelectorAll("[data-buy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      buyNow(Number(btn.dataset.buy), 1, "M");
    });
  });

  setupRipple();
  applyImageFallbacks();
};

const renderProductDetails = () => {
  const detailEl = document.getElementById("product-detail");
  if (!detailEl) return;
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id")) || 1;
  const product = PRODUCTS.find((item) => item.id === id) || PRODUCTS[0];
  detailEl.innerHTML = `
    <div class="detail-layout">
      <div class="card">
        <img
          src="${createPlaceholder(product.name)}"
          data-src="${product.image}"
          alt="${product.name}"
          data-product="${product.name}"
        />
      </div>
      <div class="detail-card">
        <p>${product.category}</p>
        <h1>${product.name}</h1>
        <h3>${formatPrice(product.price)}</h3>
        <p>${product.description}</p>
        <div class="selector" id="size-selector">
          ${["S", "M", "L", "XL"]
            .map(
              (size) =>
                `<button class="size-btn ${size === "M" ? "active" : ""}" data-size="${size}">${size}</button>`
            )
            .join("")}
        </div>
        <div class="quantity">
          <button id="qty-minus">-</button>
          <span id="qty-value">1</span>
          <button id="qty-plus">+</button>
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 10px;">
          <button class="primary-btn ripple" id="add-detail">Add to Cart</button>
          <button class="secondary-btn ripple" id="buy-now">Buy Now</button>
        </div>
      </div>
    </div>
  `;

  let quantity = 1;
  let selectedSize = "M";

  detailEl.querySelectorAll(".size-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      detailEl.querySelectorAll(".size-btn").forEach((node) => node.classList.remove("active"));
      btn.classList.add("active");
      selectedSize = btn.dataset.size;
    });
  });

  detailEl.querySelector("#qty-minus").addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    detailEl.querySelector("#qty-value").textContent = quantity;
  });

  detailEl.querySelector("#qty-plus").addEventListener("click", () => {
    quantity += 1;
    detailEl.querySelector("#qty-value").textContent = quantity;
  });

  detailEl.querySelector("#add-detail").addEventListener("click", () => {
    addToCart(product.id, quantity, selectedSize);
  });

  detailEl.querySelector("#buy-now").addEventListener("click", () => {
    buyNow(product.id, quantity, selectedSize);
  });

  setupRipple();
  applyImageFallbacks();
};

const renderCart = () => {
  const cartList = document.getElementById("cart-list");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total");
  if (!cartList) return;

  const cart = getCart();
  if (cart.length === 0) {
    cartList.innerHTML = `<div class="cart-empty">Your cart is empty. Start styling your next look.</div>`;
    if (subtotalEl) subtotalEl.textContent = formatPrice(0);
    if (totalEl) totalEl.textContent = formatPrice(0);
    return;
  }

  cartList.innerHTML = cart
    .map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.id);
      return `
        <div class="cart-item" data-id="${item.id}" data-size="${item.size}">
          <img
            src="${createPlaceholder(product.name)}"
            data-src="${product.image}"
            alt="${product.name}"
            data-product="${product.name}"
          />
          <div>
            <h4>${product.name}</h4>
            <p>Size: ${item.size}</p>
            <p>${formatPrice(product.price)}</p>
          </div>
          <div>
            <div class="quantity">
              <button class="qty-minus">-</button>
              <span>${item.quantity}</span>
              <button class="qty-plus">+</button>
            </div>
            <button class="secondary-btn remove-btn">Remove</button>
          </div>
        </div>
      `;
    })
    .join("");

  cartList.querySelectorAll(".qty-minus").forEach((btn) => {
    btn.addEventListener("click", () => updateCartItem(btn, -1));
  });

  cartList.querySelectorAll(".qty-plus").forEach((btn) => {
    btn.addEventListener("click", () => updateCartItem(btn, 1));
  });

  cartList.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => removeCartItem(btn));
  });

  updateTotals();
  applyImageFallbacks();
};

const updateCartItem = (btn, delta) => {
  const itemEl = btn.closest(".cart-item");
  const id = Number(itemEl.dataset.id);
  const size = itemEl.dataset.size;
  const cart = getCart();
  const item = cart.find((i) => i.id === id && i.size === size);
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  saveCart(cart);
  renderCart();
  updateCartCount();
};

const removeCartItem = (btn) => {
  const itemEl = btn.closest(".cart-item");
  const id = Number(itemEl.dataset.id);
  const size = itemEl.dataset.size;
  const cart = getCart().filter((i) => !(i.id === id && i.size === size));
  saveCart(cart);
  renderCart();
  updateCartCount();
};

const updateTotals = () => {
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total");
  if (!subtotalEl || !totalEl) return;
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => {
    const product = PRODUCTS.find((p) => p.id === item.id);
    return sum + product.price * item.quantity;
  }, 0);
  subtotalEl.textContent = formatPrice(subtotal);
  totalEl.textContent = formatPrice(subtotal * 1.08);
};

const setupRipple = () => {
  document.querySelectorAll(".ripple").forEach((button) => {
    if (button.dataset.rippleBound) return;
    button.dataset.rippleBound = "true";
    button.addEventListener("click", (event) => {
      const circle = document.createElement("span");
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
      circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
      const ripple = button.querySelector("span");
      if (ripple) ripple.remove();
      button.appendChild(circle);
    });
  });
};

const renderPayment = () => {
  const summaryEl = document.getElementById("payment-summary");
  const totalEl = document.getElementById("payment-total");
  if (!summaryEl || !totalEl) return;
  const cart = getCart();
  if (cart.length === 0) {
    summaryEl.innerHTML = `<div class="cart-empty">Your cart is empty. Add items before checking out.</div>`;
    totalEl.textContent = formatPrice(0);
    return;
  }
  summaryEl.innerHTML = cart
    .map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.id);
      return `
        <div class="payment-item">
          <img
            src="${createPlaceholder(product.name)}"
            data-src="${product.image}"
            alt="${product.name}"
            data-product="${product.name}"
          />
          <div>
            <strong>${product.name}</strong>
            <p>Size: ${item.size}</p>
            <p>Qty: ${item.quantity}</p>
          </div>
          <div>${formatPrice(product.price * item.quantity)}</div>
        </div>
      `;
    })
    .join("");
  const total = cart.reduce((sum, item) => {
    const product = PRODUCTS.find((p) => p.id === item.id);
    return sum + product.price * item.quantity;
  }, 0);
  totalEl.textContent = formatPrice(total);
  applyImageFallbacks();
};

const setupReveal = () => {
  const reveals = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.2 }
  );
  reveals.forEach((el) => observer.observe(el));
};

const setupMobileMenu = () => {
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".mobile-menu");
  if (!toggle || !menu) return;
  toggle.addEventListener("click", () => {
    menu.classList.toggle("active");
    toggle.classList.toggle("active");
  });
};

const initPage = () => {
  document.querySelector(".page")?.classList.add("loaded");
  updateCartCount();
  setupRipple();
  setupReveal();
  setupMobileMenu();
  renderProducts("featured-products", 3);
  renderProducts("product-grid");
  renderProductDetails();
  renderCart();
  renderPayment();
  applyImageFallbacks();
};

document.addEventListener("DOMContentLoaded", initPage);



