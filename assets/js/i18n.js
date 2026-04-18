// Shared i18n dictionary + helpers for the whole public site.
// Usage:
//   import { initI18n, t, getLocale, setLocale, onLocaleChange } from "/assets/js/i18n.js";
//   initI18n();  // reads stored locale and applies translations

export const translations = {
  en: {
    // --- existing homepage keys ---
    eyebrow: "Signature Gin & Cocktail Experience",
    tagline: "American Cocktail Bar in Aachen",
    subtitle: "Classic drinks, premium spirits, and a cozy speakeasy atmosphere.",
    getDirections: "Get directions",
    callUs: "Call us",
    email: "Email",
    openingHoursLabel: "Opening hours",
    addressLabel: "Address",
    viewOnMap: "View on map",
    contactLabel: "Contact",
    phoneLabel: "Phone:",
    emailLabel: "Email:",
    corporateLabel: "Corporate events",
    corporateDetailOne: "Our cocktail catering brings a full bar experience to your corporate event.",
    corporateDetailTwo: "Ideal for company parties, customer events, and team celebrations.",
    requestOffer: "Request an offer",
    ginTastingLabel: "Gin tastings",
    ginTastingDetailOne: "Special gin tasting events can be requested at our bar.",
    ginTastingPriceLabel: "Price:",
    ginTastingPriceValue: "€69 per person",
    requestGinTasting: "Request gin tasting",
    bookTasting: "Book a tasting",
    footer: "Discover curated gin tastings, bespoke cocktails, and cocktail catering for corporate events in and around Aachen.",
    toggleLabel: "DE",
    toggleAria: "Switch language to German",
    corporateSubject: "Corporate Event Inquiry",
    ginTastingSubject: "Gin Tasting Request",

    // --- events page ---
    navHome: "Home",
    navEvents: "Events",
    eventsHeading: "Upcoming gin tastings",
    eventsIntro: "Book your seat at our next curated gin tasting.",
    eventsEmpty: "No upcoming events right now. Check back soon — or email us to arrange a private tasting.",
    seatsLeft: "{n} seats left",
    oneSeatLeft: "1 seat left",
    soldOut: "Sold out",
    perPerson: "per person",
    book: "Book",

    // --- booking form ---
    bookingHeading: "Book your seats",
    bookingIntroFor: "For {title}",
    fullName: "Full name",
    yourEmail: "Email",
    yourPhone: "Phone (optional)",
    seatsLabel: "Number of seats",
    totalLabel: "Total",
    norefundHeading: "No-refund policy",
    norefundText: "All bookings are final. Seats are non-refundable and non-transferable. If you cannot attend, you may send a guest in your place.",
    acceptTerms: "I have read and accept the no-refund policy.",
    proceedToPayment: "Proceed to payment",
    cancel: "Cancel",
    loadingEvent: "Loading event…",
    eventNotFound: "We couldn't find that event. It may be sold out or unpublished.",
    errorSoldOut: "Sorry — not enough seats remain. Please choose fewer seats or pick another date.",
    errorGeneric: "Something went wrong. Please try again or email us.",

    // --- success / cancelled pages ---
    successHeading: "Thank you — your booking is confirmed",
    successBody: "Your payment was successful. A confirmation email is on its way. We look forward to welcoming you at The Gin Library.",
    backHome: "Back to home",
    cancelledHeading: "Payment cancelled",
    cancelledBody: "Your booking was not completed and no payment was taken. You can try again whenever you're ready.",
    tryAgain: "Try again",
  },
  de: {
    eyebrow: "Signature Gin- & Cocktail-Erlebnis",
    tagline: "Amerikanische Cocktailbar in Aachen",
    subtitle: "Klassische Drinks, Premium-Spirituosen und eine gemütliche Speakeasy-Atmosphäre.",
    getDirections: "Route anzeigen",
    callUs: "Anrufen",
    email: "E-Mail",
    openingHoursLabel: "Öffnungszeiten",
    addressLabel: "Adresse",
    viewOnMap: "Auf Karte ansehen",
    contactLabel: "Kontakt",
    phoneLabel: "Telefon:",
    emailLabel: "E-Mail:",
    corporateLabel: "Firmenveranstaltungen",
    corporateDetailOne: "Unser Cocktail-Catering bringt ein komplettes Bar-Erlebnis zu Ihrer Firmenveranstaltung.",
    corporateDetailTwo: "Ideal für Firmenfeiern, Kundenevents und Teamfeiern.",
    requestOffer: "Angebot anfragen",
    ginTastingLabel: "Gin-Tastings",
    ginTastingDetailOne: "Spezielle Gin-Tasting-Events können bei uns in der Bar angefragt werden.",
    ginTastingPriceLabel: "Preis:",
    ginTastingPriceValue: "69 € pro Person",
    requestGinTasting: "Gin-Tasting anfragen",
    bookTasting: "Tasting buchen",
    footer: "Entdecken Sie kuratierte Gin-Tastings, individuelle Cocktails und Cocktail-Catering für Firmenveranstaltungen in und um Aachen.",
    toggleLabel: "EN",
    toggleAria: "Sprache auf Englisch umstellen",
    corporateSubject: "Anfrage Firmenveranstaltung",
    ginTastingSubject: "Anfrage Gin-Tasting",

    navHome: "Startseite",
    navEvents: "Events",
    eventsHeading: "Kommende Gin-Tastings",
    eventsIntro: "Sichern Sie sich Ihren Platz bei unserem nächsten kuratierten Gin-Tasting.",
    eventsEmpty: "Derzeit keine geplanten Events. Schauen Sie bald wieder vorbei — oder schreiben Sie uns für ein privates Tasting.",
    seatsLeft: "Noch {n} Plätze frei",
    oneSeatLeft: "Noch 1 Platz frei",
    soldOut: "Ausgebucht",
    perPerson: "pro Person",
    book: "Buchen",

    bookingHeading: "Plätze buchen",
    bookingIntroFor: "Für {title}",
    fullName: "Vollständiger Name",
    yourEmail: "E-Mail",
    yourPhone: "Telefon (optional)",
    seatsLabel: "Anzahl der Plätze",
    totalLabel: "Gesamt",
    norefundHeading: "Keine-Erstattung-Richtlinie",
    norefundText: "Alle Buchungen sind verbindlich. Plätze sind nicht erstattungsfähig und nicht übertragbar auf ein anderes Event. Falls Sie nicht kommen können, dürfen Sie einen Gast an Ihrer Stelle schicken.",
    acceptTerms: "Ich habe die Keine-Erstattung-Richtlinie gelesen und akzeptiere sie.",
    proceedToPayment: "Weiter zur Zahlung",
    cancel: "Abbrechen",
    loadingEvent: "Event wird geladen…",
    eventNotFound: "Wir konnten dieses Event nicht finden. Möglicherweise ist es ausgebucht oder nicht mehr verfügbar.",
    errorSoldOut: "Leider nicht genug Plätze verfügbar. Bitte wählen Sie weniger Plätze oder ein anderes Datum.",
    errorGeneric: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie uns.",

    successHeading: "Danke — Ihre Buchung ist bestätigt",
    successBody: "Ihre Zahlung war erfolgreich. Eine Bestätigungs-E-Mail ist unterwegs. Wir freuen uns auf Ihren Besuch in The Gin Library.",
    backHome: "Zur Startseite",
    cancelledHeading: "Zahlung abgebrochen",
    cancelledBody: "Ihre Buchung wurde nicht abgeschlossen und es wurde keine Zahlung vorgenommen. Sie können es jederzeit erneut versuchen.",
    tryAgain: "Erneut versuchen",
  },
};

const STORAGE_KEY = "tgl_locale";
let current = "en";
const listeners = new Set();

export function getLocale() {
  return current;
}

export function setLocale(locale) {
  if (locale !== "en" && locale !== "de") return;
  current = locale;
  try { localStorage.setItem(STORAGE_KEY, locale); } catch {}
  document.documentElement.lang = locale;
  applyTranslations();
  listeners.forEach((fn) => fn(locale));
}

export function onLocaleChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function t(key, params) {
  const dict = translations[current] || translations.en;
  let s = dict[key] ?? translations.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return s;
}

export function applyTranslations(root = document) {
  const dict = translations[current] || translations.en;
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });
  root.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria-label");
    if (dict[key]) el.setAttribute("aria-label", dict[key]);
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key]) el.setAttribute("placeholder", dict[key]);
  });
}

export function initI18n() {
  let stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch {}
  current = stored === "de" ? "de" : "en";
  document.documentElement.lang = current;
  applyTranslations();
  // Wire up a standard language toggle if present.
  const toggle = document.getElementById("language-toggle");
  if (toggle) {
    const syncToggle = () => {
      toggle.textContent = t("toggleLabel");
      toggle.setAttribute("aria-label", t("toggleAria"));
    };
    syncToggle();
    onLocaleChange(syncToggle);
    toggle.addEventListener("click", () => {
      setLocale(current === "en" ? "de" : "en");
    });
  }
}

export function formatMoney(cents, currency) {
  return new Intl.NumberFormat(current === "de" ? "de-DE" : "en-GB", {
    style: "currency",
    currency: (currency || "eur").toUpperCase(),
  }).format(cents / 100);
}

export function formatDateTime(iso) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(current === "de" ? "de-DE" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(d);
}
