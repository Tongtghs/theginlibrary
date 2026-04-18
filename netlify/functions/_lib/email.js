import { Resend } from "resend";

let resendClient;
function getResend() {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY must be set");
    resendClient = new Resend(key);
  }
  return resendClient;
}

const T = {
  en: {
    subject: (title) => `Your booking: ${title}`,
    heading: "Your booking is confirmed",
    hi: (name) => `Hi ${name},`,
    thanks: "Thank you for booking with The Gin Library. We've received your payment and reserved your seats.",
    when: "When",
    where: "Where",
    address: "Am Büchel 11, 52062 Aachen, Germany",
    seats: "Seats",
    total: "Total paid",
    norefund: "Please note: bookings are non-refundable. If you have any questions, reply to this email.",
    seeYou: "See you soon,",
    signoff: "The Gin Library team",
    adminSubject: (title, name) => `New booking: ${title} — ${name}`,
    adminHeading: "New booking",
  },
  de: {
    subject: (title) => `Ihre Buchung: ${title}`,
    heading: "Ihre Buchung ist bestätigt",
    hi: (name) => `Hallo ${name},`,
    thanks: "Vielen Dank für Ihre Buchung bei The Gin Library. Wir haben Ihre Zahlung erhalten und Ihre Plätze reserviert.",
    when: "Wann",
    where: "Wo",
    address: "Am Büchel 11, 52062 Aachen, Deutschland",
    seats: "Plätze",
    total: "Gesamtbetrag",
    norefund: "Bitte beachten Sie: Buchungen sind nicht erstattungsfähig. Bei Fragen antworten Sie einfach auf diese E-Mail.",
    seeYou: "Bis bald,",
    signoff: "Ihr Team von The Gin Library",
    adminSubject: (title, name) => `Neue Buchung: ${title} — ${name}`,
    adminHeading: "Neue Buchung",
  },
};

function formatDateTime(iso, locale) {
  const d = new Date(iso);
  const opts = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
    timeZoneName: "short",
  };
  return new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-GB", opts).format(d);
}

function formatMoney(cents, currency, locale) {
  return new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-GB", {
    style: "currency",
    currency: (currency || "eur").toUpperCase(),
  }).format(cents / 100);
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function customerHtml({ t, title, dateStr, seats, totalStr, name }) {
  return `<!doctype html>
<html><body style="margin:0;background:#0b0b0b;color:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;padding:0">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0b0b;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;background:#141414;border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden">
        <tr><td style="padding:32px 32px 16px">
          <p style="margin:0 0 8px;letter-spacing:0.2em;text-transform:uppercase;color:#d7c5a5;font-size:12px">The Gin Library</p>
          <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#f5f5f5;font-weight:400">${escapeHtml(t.heading)}</h1>
        </td></tr>
        <tr><td style="padding:8px 32px 0;color:#dcdcdc;font-size:15px;line-height:1.6">
          <p style="margin:0 0 16px">${escapeHtml(t.hi(name))}</p>
          <p style="margin:0 0 20px">${escapeHtml(t.thanks)}</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid rgba(255,255,255,0.1);margin-top:8px">
            <tr><td style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.08)"><strong style="color:#d7c5a5">${escapeHtml(t.when)}</strong><br>${escapeHtml(title)} — ${escapeHtml(dateStr)}</td></tr>
            <tr><td style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.08)"><strong style="color:#d7c5a5">${escapeHtml(t.where)}</strong><br>${escapeHtml(t.address)}</td></tr>
            <tr><td style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.08)"><strong style="color:#d7c5a5">${escapeHtml(t.seats)}</strong><br>${escapeHtml(String(seats))}</td></tr>
            <tr><td style="padding:14px 0"><strong style="color:#d7c5a5">${escapeHtml(t.total)}</strong><br>${escapeHtml(totalStr)}</td></tr>
          </table>
          <p style="margin:24px 0 0;color:#9a9a9a;font-size:13px;line-height:1.6">${escapeHtml(t.norefund)}</p>
          <p style="margin:24px 0 0">${escapeHtml(t.seeYou)}<br>${escapeHtml(t.signoff)}</p>
        </td></tr>
        <tr><td style="padding:24px 32px 32px;color:#6b6b6b;font-size:12px;border-top:1px solid rgba(255,255,255,0.08);margin-top:16px">
          The Gin Library · Am Büchel 11 · 52062 Aachen
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function customerText({ t, title, dateStr, seats, totalStr, name }) {
  return [
    t.hi(name),
    "",
    t.thanks,
    "",
    `${t.when}: ${title} — ${dateStr}`,
    `${t.where}: ${t.address}`,
    `${t.seats}: ${seats}`,
    `${t.total}: ${totalStr}`,
    "",
    t.norefund,
    "",
    t.seeYou,
    t.signoff,
  ].join("\n");
}

export async function sendBookingConfirmation({ booking, event }) {
  const locale = booking.locale === "de" ? "de" : "en";
  const t = T[locale];
  const title = locale === "de" ? event.title_de : event.title_en;
  const dateStr = formatDateTime(event.starts_at, locale);
  const totalStr = formatMoney(booking.total_cents, booking.currency, locale);
  const from = process.env.EMAIL_FROM || "The Gin Library <bookings@theginlibrary.de>";

  const resend = getResend();
  await resend.emails.send({
    from,
    to: booking.customer_email,
    subject: t.subject(title),
    html: customerHtml({ t, title, dateStr, seats: booking.seats, totalStr, name: booking.customer_name }),
    text: customerText({ t, title, dateStr, seats: booking.seats, totalStr, name: booking.customer_name }),
  });
}

export async function sendAdminNotification({ booking, event }) {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!to) return;
  const t = T.en;
  const title = event.title_en;
  const dateStr = formatDateTime(event.starts_at, "en");
  const totalStr = formatMoney(booking.total_cents, booking.currency, "en");
  const from = process.env.EMAIL_FROM || "The Gin Library <bookings@theginlibrary.de>";

  const lines = [
    `${t.adminHeading}`,
    "",
    `Event:    ${title} — ${dateStr}`,
    `Name:     ${booking.customer_name}`,
    `Email:    ${booking.customer_email}`,
    `Phone:    ${booking.customer_phone || "—"}`,
    `Seats:    ${booking.seats}`,
    `Total:    ${totalStr}`,
    `Locale:   ${booking.locale}`,
    `Stripe:   ${booking.stripe_session_id || "—"}`,
  ];

  const resend = getResend();
  await resend.emails.send({
    from,
    to,
    subject: t.adminSubject(title, booking.customer_name),
    text: lines.join("\n"),
  });
}
