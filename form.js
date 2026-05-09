const roomData = {
  living: {
    title: "Вітальня",
    image: "images/hero-room.svg",
    text: "Для вітальні підійдуть м'яке світло, декоративна подушка та невелика рослина.",
  },
  desk: {
    title: "Робочий куточок",
    image: "images/organizer.svg",
    text: "Для робочого місця варто додати лампу, органайзер і чашку для щоденних ритуалів.",
  },
  bedroom: {
    title: "Спальня",
    image: "images/candle.svg",
    text: "Для спальні краще обрати спокійне світло, свічку та текстиль у теплих відтінках.",
  },
};

const decorForm = document.querySelector("#decorForm");
const formResult = document.querySelector("#formResult");
const roomSelect = document.querySelector("#roomType");
const previewImage = document.querySelector("#roomPreviewImage");
const previewTitle = document.querySelector("#roomPreviewTitle");
const previewText = document.querySelector("#roomPreviewText");

function setError(fieldName, message) {
  const errorElement = document.querySelector(`[data-error-for="${fieldName}"]`);
  const field = decorForm.elements[fieldName];

  if (errorElement) {
    errorElement.textContent = message;
  }

  if (field && "classList" in field) {
    field.classList.toggle("is-invalid", Boolean(message));
  }
}

function clearErrors() {
  decorForm.querySelectorAll(".field-error").forEach((errorElement) => {
    errorElement.textContent = "";
  });

  decorForm.querySelectorAll(".is-invalid").forEach((field) => {
    field.classList.remove("is-invalid");
  });
}

function validateLetters(value) {
  return /^[А-Яа-яІіЇїЄєҐґA-Za-z' -]+$/.test(value.trim());
}

function updateRoomPreview() {
  const selectedRoom = roomData[roomSelect.value];

  if (!selectedRoom) {
    previewImage.src = "images/hero-room.svg";
    previewImage.alt = "Приклад інтер'єру Urban Nest";
    previewTitle.textContent = "Оберіть кімнату";
    previewText.textContent = "Після вибору кімнати тут зміниться зображення та коротка рекомендація.";
    return;
  }

  previewImage.src = selectedRoom.image;
  previewImage.alt = `Підбір для кімнати: ${selectedRoom.title}`;
  previewTitle.textContent = selectedRoom.title;
  previewText.textContent = selectedRoom.text;
}

function validateForm(formData) {
  let isValid = true;
  const name = formData.get("clientName").trim();
  const city = formData.get("clientCity").trim();
  const roomType = formData.get("roomType");
  const budget = formData.get("budget");
  const selectedItems = formData.getAll("items");

  if (!name) {
    setError("clientName", "Введіть ім'я.");
    isValid = false;
  } else if (!validateLetters(name)) {
    setError("clientName", "Ім'я має містити тільки літери.");
    isValid = false;
  }

  if (!city) {
    setError("clientCity", "Введіть місто.");
    isValid = false;
  } else if (!validateLetters(city)) {
    setError("clientCity", "Назва міста має містити тільки літери.");
    isValid = false;
  }

  if (!roomType) {
    setError("roomType", "Оберіть кімнату.");
    isValid = false;
  }

  if (!budget) {
    setError("budget", "Оберіть бюджет.");
    isValid = false;
  }

  if (selectedItems.length === 0) {
    setError("items", "Оберіть хоча б один елемент.");
    isValid = false;
  }

  return isValid;
}

function renderResult(formData) {
  const room = roomData[formData.get("roomType")];
  const selectedItems = formData.getAll("items").join(", ");

  decorForm.hidden = true;
  formResult.hidden = false;
  formResult.innerHTML = `
    <p class="eyebrow">Результат форми</p>
    <h3>Підбір для ${formData.get("clientName")}</h3>
    <p><strong>Місто:</strong> ${formData.get("clientCity")}</p>
    <p><strong>Кімната:</strong> ${room.title}</p>
    <p><strong>Бюджет:</strong> ${formData.get("budget")}</p>
    <p><strong>Елементи:</strong> ${selectedItems}</p>
    <p>${room.text}</p>
    <button class="small-button" type="button" id="resetDecorForm">Заповнити ще раз</button>
  `;

  document.querySelector("#resetDecorForm").addEventListener("click", () => {
    decorForm.reset();
    updateRoomPreview();
    formResult.hidden = true;
    decorForm.hidden = false;
  });
}

roomSelect.addEventListener("change", updateRoomPreview);

decorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearErrors();

  const formData = new FormData(decorForm);

  if (!validateForm(formData)) {
    return;
  }

  renderResult(formData);
});
