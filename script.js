const API_URL = "https://fakestoreapi.com";

const localProducts = {
  lamp: {
    title: "Лампа Luma",
    price: "1 290 грн",
    description: "Компактна лампа для робочого столу, тумби або вечірнього читання.",
    category: "Urban Nest",
    images: [
      "images/lamp.svg",
      "images/hero-room.svg",
      "images/about-corner.svg",
    ],
  },
  mug: {
    title: "Чашка Nord",
    price: "420 грн",
    description: "Матова керамічна чашка для кави, чаю та повільних ранків.",
    category: "Urban Nest",
    images: [
      "images/mug.svg",
      "images/hero-room.svg",
      "images/about-corner.svg",
    ],
  },
  candle: {
    title: "Свічка Calm",
    price: "560 грн",
    description: "Ароматична свічка з теплим поєднанням ванілі, дерева та цитрусу.",
    category: "Urban Nest",
    images: [
      "images/candle.svg",
      "images/about-corner.svg",
      "images/hero-room.svg",
    ],
  },
  plant: {
    title: "Рослина Olive",
    price: "730 грн",
    description: "Декоративна рослина для полиці, робочого столу або світлого підвіконня.",
    category: "Urban Nest",
    images: [
      "images/plant.svg",
      "images/hero-room.svg",
      "images/about-corner.svg",
    ],
  },
  pillow: {
    title: "Подушка Soft Square",
    price: "680 грн",
    description: "М'яка декоративна подушка у спокійному відтінку для дивана або крісла.",
    category: "Urban Nest",
    images: [
      "images/pillow.svg",
      "images/about-corner.svg",
      "images/hero-room.svg",
    ],
  },
  organizer: {
    title: "Органайзер Grid",
    price: "510 грн",
    description: "Настільний органайзер для нотаток, ручок, карток і дрібних речей.",
    category: "Urban Nest",
    images: [
      "images/organizer.svg",
      "images/hero-room.svg",
      "images/about-corner.svg",
    ],
  },
};

const modal = document.querySelector("#productModal");
const galleryImage = document.querySelector("#galleryImage");
const galleryCounter = document.querySelector("#galleryCounter");
const galleryDots = document.querySelector("#galleryDots");
const modalTitle = document.querySelector("#modalTitle");
const modalDescription = document.querySelector("#modalDescription");
const modalPrice = document.querySelector("#modalPrice");
const modalCategory = document.querySelector("#modalCategory");
const nextButton = document.querySelector(".gallery-next");
const prevButton = document.querySelector(".gallery-prev");
const productGrid = document.querySelector("#apiProductGrid");
const catalogStatus = document.querySelector("#catalogStatus");
const catalogFilters = document.querySelector("#catalogFilters");
const categoryFilter = document.querySelector("#categoryFilter");
const limitFilter = document.querySelector("#limitFilter");
const sortFilter = document.querySelector("#sortFilter");
const catalogTabs = document.querySelectorAll(".catalog-tab");
const catalogPanels = document.querySelectorAll(".catalog-panel");

let apiProducts = [];
let apiLoaded = false;
let activeProduct = localProducts.lamp;
let activeImageIndex = 0;

function formatApiPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

function getApiProductImages(product) {
  return [
    product.image,
    "images/hero-room.svg",
    "images/about-corner.svg",
  ];
}

function setStatus(message, type = "info") {
  catalogStatus.textContent = message;
  catalogStatus.className = `api-status ${type}`;
}

function buildProductsUrl() {
  const category = categoryFilter.value;
  const limit = limitFilter.value;
  const sort = sortFilter.value;
  const basePath = category
    ? `${API_URL}/products/category/${encodeURIComponent(category)}`
    : `${API_URL}/products`;
  const params = new URLSearchParams({ sort });

  if (!category) {
    params.set("limit", limit);
  }

  return `${basePath}?${params.toString()}`;
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

function renderApiProducts(items) {
  productGrid.innerHTML = "";

  if (items.length === 0) {
    setStatus("За вибраними параметрами товари не знайдено.", "empty");
    return;
  }

  setStatus(`Завантажено товарів: ${items.length}`, "success");

  items.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card api-product-card";
    card.tabIndex = 0;
    card.dataset.apiProductId = product.id;
    card.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <span class="product-category">${product.category}</span>
      <h3>${product.title}</h3>
      <p>${truncateText(product.description, 92)}</p>
      <span class="price">${formatApiPrice(product.price)}</span>
      <button class="small-button open-product" type="button">Переглянути</button>
    `;

    card.addEventListener("click", () => openApiProduct(product.id));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openApiProduct(product.id);
      }
    });

    productGrid.appendChild(card);
  });
}

async function loadCategories() {
  const response = await fetch(`${API_URL}/products/categories`);

  if (!response.ok) {
    throw new Error("Не вдалося завантажити категорії.");
  }

  const categories = await response.json();

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

async function loadApiProducts() {
  setStatus("Завантаження товарів...");
  productGrid.innerHTML = "";

  try {
    const response = await fetch(buildProductsUrl());

    if (!response.ok) {
      throw new Error("Сервер повернув помилку.");
    }

    const data = await response.json();
    const limit = Number(limitFilter.value);
    apiProducts = categoryFilter.value ? data.slice(0, limit) : data;
    renderApiProducts(apiProducts);
  } catch (error) {
    apiProducts = [];
    productGrid.innerHTML = "";
    setStatus("Помилка завантаження. Перевірте інтернет-з'єднання або спробуйте пізніше.", "error");
  }
}

function renderDots() {
  galleryDots.innerHTML = "";

  activeProduct.images.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.classList.add("gallery-dot");
    dot.setAttribute("aria-label", `Показати зображення ${index + 1}`);

    if (index === activeImageIndex) {
      dot.classList.add("active");
    }

    dot.addEventListener("click", () => {
      activeImageIndex = index;
      renderGallery();
    });

    galleryDots.appendChild(dot);
  });
}

function renderGallery() {
  const imagePath = activeProduct.images[activeImageIndex];
  galleryImage.src = imagePath;
  galleryImage.alt = `${activeProduct.title}, зображення ${activeImageIndex + 1}`;
  galleryCounter.textContent = `${activeImageIndex + 1} / ${activeProduct.images.length}`;
  renderDots();
}

function showProduct(product) {
  activeProduct = product;
  activeImageIndex = 0;

  modalTitle.textContent = activeProduct.title;
  modalDescription.textContent = activeProduct.description;
  modalPrice.textContent = activeProduct.price;
  modalCategory.textContent = `Категорія: ${activeProduct.category}`;
  renderGallery();

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function openLocalProduct(productId) {
  const product = localProducts[productId];

  if (product) {
    showProduct(product);
  }
}

function openApiProduct(productId) {
  const product = apiProducts.find((item) => item.id === Number(productId));

  if (!product) {
    return;
  }

  showProduct({
    title: product.title,
    price: formatApiPrice(product.price),
    description: product.description,
    category: product.category,
    images: getApiProductImages(product),
  });
}

function closeProduct() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function showNextImage() {
  activeImageIndex = (activeImageIndex + 1) % activeProduct.images.length;
  renderGallery();
}

function showPrevImage() {
  activeImageIndex = (activeImageIndex - 1 + activeProduct.images.length) % activeProduct.images.length;
  renderGallery();
}

function switchCatalogTab(tab) {
  catalogTabs.forEach((tabButton) => {
    const isActive = tabButton === tab;
    tabButton.classList.toggle("active", isActive);
    tabButton.setAttribute("aria-selected", String(isActive));
  });

  catalogPanels.forEach((panel) => {
    const isActive = panel.id === tab.getAttribute("aria-controls");
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
  });

  if (tab.id === "apiTab" && !apiLoaded) {
    apiLoaded = true;
    initApiCatalog();
  }
}

document.querySelectorAll("[data-local-product]").forEach((card) => {
  const productId = card.dataset.localProduct;

  card.addEventListener("click", () => openLocalProduct(productId));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLocalProduct(productId);
    }
  });
});

catalogTabs.forEach((tab) => {
  tab.addEventListener("click", () => switchCatalogTab(tab));
});

catalogFilters.addEventListener("submit", (event) => {
  event.preventDefault();
  loadApiProducts();
});

[categoryFilter, limitFilter, sortFilter].forEach((filter) => {
  filter.addEventListener("change", loadApiProducts);
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeProduct);
});

nextButton.addEventListener("click", showNextImage);
prevButton.addEventListener("click", showPrevImage);

document.addEventListener("keydown", (event) => {
  if (!modal.classList.contains("is-open")) {
    return;
  }

  if (event.key === "Escape") {
    closeProduct();
  }

  if (event.key === "ArrowRight") {
    showNextImage();
  }

  if (event.key === "ArrowLeft") {
    showPrevImage();
  }
});

async function initApiCatalog() {
  try {
    await loadCategories();
  } catch (error) {
    setStatus("Категорії не завантажились, але каталог все одно можна відкрити.", "error");
  }

  loadApiProducts();
}
