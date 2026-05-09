const products = {
  lamp: {
    title: "Лампа Luma",
    price: "1 290 грн",
    description: "Компактна лампа для робочого столу, тумби або вечірнього читання.",
    images: [
      "images/lamp.svg",
      "images/hero-room.svg",
      "images/about-corner.svg",
    ],
    alt: "Настільна лампа Luma",
  },
  mug: {
    title: "Чашка Nord",
    price: "420 грн",
    description: "Матова керамічна чашка для кави, чаю та повільних ранків.",
    images: [
      "images/mug.svg",
      "images/hero-room.svg",
      "images/about-corner.svg",
    ],
    alt: "Керамічна чашка Nord",
  },
  candle: {
    title: "Свічка Calm",
    price: "560 грн",
    description: "Ароматична свічка з теплим поєднанням ванілі, дерева та цитрусу.",
    images: [
      "images/candle.svg",
      "images/about-corner.svg",
      "images/hero-room.svg",
    ],
    alt: "Ароматична свічка Calm",
  },
  plant: {
    title: "Рослина Olive",
    price: "730 грн",
    description: "Декоративна рослина для полиці, робочого столу або світлого підвіконня.",
    images: [
      "images/plant.svg",
      "images/hero-room.svg",
      "images/about-corner.svg",
    ],
    alt: "Декоративна рослина Olive",
  },
  pillow: {
    title: "Подушка Soft Square",
    price: "680 грн",
    description: "М'яка декоративна подушка у спокійному відтінку для дивана або крісла.",
    images: [
      "images/pillow.svg",
      "images/about-corner.svg",
      "images/hero-room.svg",
    ],
    alt: "Подушка Soft Square",
  },
  organizer: {
    title: "Органайзер Grid",
    price: "510 грн",
    description: "Настільний органайзер для нотаток, ручок, карток і дрібних речей.",
    images: [
      "images/organizer.svg",
      "images/hero-room.svg",
      "images/about-corner.svg",
    ],
    alt: "Настільний органайзер Grid",
  },
};

const modal = document.querySelector("#productModal");
const galleryImage = document.querySelector("#galleryImage");
const galleryCounter = document.querySelector("#galleryCounter");
const galleryDots = document.querySelector("#galleryDots");
const modalTitle = document.querySelector("#modalTitle");
const modalDescription = document.querySelector("#modalDescription");
const modalPrice = document.querySelector("#modalPrice");
const nextButton = document.querySelector(".gallery-next");
const prevButton = document.querySelector(".gallery-prev");

let activeProduct = products.lamp;
let activeImageIndex = 0;

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
  galleryImage.alt = `${activeProduct.alt}, зображення ${activeImageIndex + 1}`;
  galleryCounter.textContent = `${activeImageIndex + 1} / ${activeProduct.images.length}`;
  renderDots();
}

function openProduct(productId) {
  activeProduct = products[productId];
  activeImageIndex = 0;

  modalTitle.textContent = activeProduct.title;
  modalDescription.textContent = activeProduct.description;
  modalPrice.textContent = activeProduct.price;
  renderGallery();

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
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

document.querySelectorAll(".product-card").forEach((card) => {
  const productId = card.dataset.product;

  card.addEventListener("click", () => {
    openProduct(productId);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProduct(productId);
    }
  });
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
