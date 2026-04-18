import {
  initI18n,
  t,
  getLocale,
  onLocaleChange,
  formatMoney,
  formatDateTime,
} from "/assets/js/i18n.js";

const formEl = document.getElementById("booking-form");
const titleEl = document.getElementById("booking-title");
const dateEl = document.getElementById("booking-date");
const descEl = document.getElementById("booking-desc");
const totalEl = document.getElementById("booking-total");
const submitBtn = document.getElementById("booking-submit");
const errorEl = document.getElementById("booking-error");
const seatsInput = document.getElementById("seats");
const statusEl = document.getElementById("booking-status");
const formContainer = document.getElementById("booking-form-container");

const params = new URLSearchParams(location.search);
const slug = params.get("event") || "";

let event = null;

function findEvent(all) {
  return all.find((e) => e.slug === slug) || null;
}

function renderEventDetails() {
  if (!event) return;
  const locale = getLocale();
  const title = locale === "de" ? event.title_de : event.title_en;
  const desc = locale === "de" ? event.description_de : event.description_en;
  titleEl.textContent = title;
  dateEl.textContent = formatDateTime(event.starts_at);
  descEl.textContent = desc;
  seatsInput.max = String(Math.min(event.seats_available, 20));
  seatsInput.min = "1";
  if (Number(seatsInput.value) > event.seats_available) {
    seatsInput.value = String(Math.max(event.seats_available, 1));
  }
  updateTotal();
}

function updateTotal() {
  if (!event) return;
  const n = Math.max(1, Math.min(Number(seatsInput.value) || 1, event.seats_available || 1));
  const cents = n * event.price_cents;
  totalEl.textContent = formatMoney(cents, event.currency);
}

function showError(key) {
  errorEl.textContent = t(key);
  errorEl.hidden = false;
}

function hideError() {
  errorEl.hidden = true;
  errorEl.textContent = "";
}

async function load() {
  statusEl.textContent = t("loadingEvent");
  try {
    const r = await fetch("/.netlify/functions/events-list");
    if (!r.ok) throw new Error(String(r.status));
    const data = await r.json();
    event = findEvent(data.events || []);
  } catch (err) {
    console.error("booking load failed", err);
  }
  if (!event) {
    statusEl.textContent = t("eventNotFound");
    formContainer.hidden = true;
    return;
  }
  statusEl.hidden = true;
  formContainer.hidden = false;
  renderEventDetails();
}

seatsInput.addEventListener("input", updateTotal);

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();
  if (!event) return;

  const seats = Number(seatsInput.value);
  if (!Number.isFinite(seats) || seats < 1) {
    showError("errorGeneric");
    return;
  }

  const payload = {
    slug,
    seats,
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    locale: getLocale(),
  };

  submitBtn.disabled = true;
  const originalLabel = submitBtn.textContent;
  submitBtn.textContent = "…";

  try {
    const r = await fetch("/.netlify/functions/create-checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      if (data.code === "SOLD_OUT") showError("errorSoldOut");
      else showError("errorGeneric");
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
      return;
    }
    if (!data.url) {
      showError("errorGeneric");
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
      return;
    }
    window.location.href = data.url;
  } catch (err) {
    console.error("checkout request failed", err);
    showError("errorGeneric");
    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;
  }
});

initI18n();
onLocaleChange(renderEventDetails);
load();
