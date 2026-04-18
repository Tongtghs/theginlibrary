import {
  initI18n,
  t,
  getLocale,
  onLocaleChange,
  formatMoney,
  formatDateTime,
} from "/assets/js/i18n.js";

const listEl = document.getElementById("events-list");
const emptyEl = document.getElementById("events-empty");

let eventsCache = [];

function seatsLabel(n) {
  if (n <= 0) return t("soldOut");
  if (n === 1) return t("oneSeatLeft");
  return t("seatsLeft", { n });
}

function render() {
  const locale = getLocale();
  listEl.innerHTML = "";

  if (eventsCache.length === 0) {
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;

  for (const ev of eventsCache) {
    const title = locale === "de" ? ev.title_de : ev.title_en;
    const desc = locale === "de" ? ev.description_de : ev.description_en;
    const seatsText = seatsLabel(ev.seats_available);
    const sold = ev.seats_available <= 0;

    const card = document.createElement("article");
    card.className = "event-card";
    card.innerHTML = `
      <div class="event-card__body">
        <p class="event-card__date">${escapeHtml(formatDateTime(ev.starts_at))}</p>
        <h2 class="event-card__title">${escapeHtml(title)}</h2>
        <p class="event-card__desc">${escapeHtml(desc)}</p>
        <div class="event-card__meta">
          <span class="event-card__price">${escapeHtml(formatMoney(ev.price_cents, ev.currency))} <span class="event-card__price-unit">${escapeHtml(t("perPerson"))}</span></span>
          <span class="event-card__seats ${sold ? "is-soldout" : ""}">${escapeHtml(seatsText)}</span>
        </div>
        ${
          sold
            ? `<button class="button" disabled>${escapeHtml(t("soldOut"))}</button>`
            : `<a class="button primary" href="/book.html?event=${encodeURIComponent(ev.slug)}">${escapeHtml(t("book"))}</a>`
        }
      </div>
    `;
    listEl.appendChild(card);
  }
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function load() {
  try {
    const r = await fetch("/.netlify/functions/events-list");
    if (!r.ok) throw new Error(`status ${r.status}`);
    const data = await r.json();
    eventsCache = data.events || [];
  } catch (err) {
    console.error("events load failed", err);
    eventsCache = [];
  }
  render();
}

initI18n();
onLocaleChange(render);
load();
