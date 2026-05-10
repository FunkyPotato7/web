const API_ENDPOINT = "https://fakestoreapi.com/carts";

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

const productMap = {
  "Лампа": 1,
  "Кераміка": 2,
  "Текстиль": 3,
};

const decorForm = document.querySelector("#decorForm");
const formResult = document.querySelector("#formResult");
const roomSelect = document.querySelector("#roomType");
const previewImage = document.querySelector("#roomPreviewImage");
const previewTitle = document.querySelector("#roomPreviewTitle");
const previewText = document.querySelector("#roomPreviewText");
const submitButton = decorForm.querySelector("button[type='submit']");

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

function buildPayload(formData) {
  const selectedItems = formData.getAll("items");
  const selectedRoom = roomData[formData.get("roomType")];

  return {
    userId: 1,
    date: new Date().toISOString().slice(0, 10),
    products: selectedItems.map((item) => ({
      productId: productMap[item],
      quantity: 1,
    })),
    decorRequest: {
      clientName: formData.get("clientName").trim(),
      clientCity: formData.get("clientCity").trim(),
      room: selectedRoom.title,
      budget: formData.get("budget"),
      items: selectedItems,
      recommendation: selectedRoom.text,
    },
  };
}

async function sendDecorRequest(payload) {
  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Сервер повернув помилку під час відправки.");
  }

  return response.json();
}

function renderSuccess(payload, serverResponse) {
  const request = payload.decorRequest;

  decorForm.hidden = true;
  formResult.hidden = false;
  formResult.classList.remove("error");
  formResult.innerHTML = `
    <p class="eyebrow">Дані відправлено</p>
    <h3>Підбір для ${request.clientName}</h3>
    <p><strong>ID відповіді сервера:</strong> ${serverResponse.id}</p>
    <p><strong>Місто:</strong> ${request.clientCity}</p>
    <p><strong>Кімната:</strong> ${request.room}</p>
    <p><strong>Бюджет:</strong> ${request.budget}</p>
    <p><strong>Елементи:</strong> ${request.items.join(", ")}</p>
    <p>${request.recommendation}</p>
    <details class="json-preview">
      <summary>JSON, який було відправлено</summary>
      <pre>${JSON.stringify(payload, null, 2)}</pre>
    </details>
    <button class="small-button" type="button" id="resetDecorForm">Заповнити ще раз</button>
  `;

  document.querySelector("#resetDecorForm").addEventListener("click", () => {
    decorForm.reset();
    updateRoomPreview();
    formResult.hidden = true;
    decorForm.hidden = false;
  });
}

function renderSendError(message) {
  formResult.hidden = false;
  formResult.classList.add("error");
  formResult.innerHTML = `
    <p class="eyebrow">Помилка відправки</p>
    <h3>Не вдалося відправити дані</h3>
    <p>${message}</p>
  `;
}

function setSendingState(isSending) {
  submitButton.disabled = isSending;
  submitButton.textContent = isSending ? "Відправляємо..." : "Відправити підбір";
}

roomSelect.addEventListener("change", updateRoomPreview);

decorForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();
  formResult.hidden = true;

  const formData = new FormData(decorForm);

  if (!validateForm(formData)) {
    return;
  }

  const payload = buildPayload(formData);

  try {
    setSendingState(true);
    const serverResponse = await sendDecorRequest(payload);
    renderSuccess(payload, serverResponse);
  } catch (error) {
    renderSendError("Перевірте інтернет-з'єднання або спробуйте ще раз пізніше.");
  } finally {
    setSendingState(false);
  }
});
