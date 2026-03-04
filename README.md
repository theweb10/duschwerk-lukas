# Badverglasung Handwerksbetrieb – Website

Professionelle Unternehmenswebsite für einen Badverglasung-Handwerksbetrieb.
**Stack:** React 18 + Vite + TailwindCSS (Frontend) | Node.js + Express + SQLite (Backend)

---

## Schnellstart

### Voraussetzungen
- Node.js ≥ 18
- npm ≥ 9

### 1. Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env  # Konfiguration anpassen
node server.js        # http://localhost:3001
```

Die SQLite-Datenbank wird automatisch unter `backend/data/badverglasung.db` angelegt.

---

## Projektstruktur

```
ClaudeCodeTest/
├── frontend/          # React + Vite + TailwindCSS
│   └── src/
│       ├── components/
│       │   ├── layout/   Header, Footer
│       │   └── sections/ Hero, ServicesPreview, Testimonials, ContactForm
│       ├── pages/        Home, Services, References, About, Contact
│       ├── hooks/        useContactForm.js
│       └── utils/        api.js
│
└── backend/           # Express + SQLite
    ├── routes/        contact.js, leads.js
    ├── models/        db.js (SQLite Setup)
    ├── middleware/    validate.js, rateLimiter.js
    ├── services/      crm.js (HubSpot/Zoho/Webhook)
    └── server.js
```

---

## Konfiguration (backend/.env)

| Variable | Beschreibung |
|----------|-------------|
| `PORT` | Server-Port (Standard: 3001) |
| `EMAIL_HOST` | SMTP Host (z.B. smtp.mailtrap.io für Tests) |
| `EMAIL_PORT` | SMTP Port |
| `EMAIL_USER` | SMTP Benutzername |
| `EMAIL_PASS` | SMTP Passwort |
| `EMAIL_FROM` | Absenderadresse |
| `EMAIL_TO` | Empfänger für Anfragen |
| `CRM_PROVIDER` | `hubspot` \| `zoho` \| `webhook` \| `none` |
| `HUBSPOT_API_KEY` | HubSpot Private App Token |
| `ZOHO_ACCESS_TOKEN` | Zoho CRM OAuth Token |
| `CRM_WEBHOOK_URL` | Zapier / generischer Webhook |
| `CORS_ORIGIN` | Erlaubte Frontend-URL(s) |

---

## API Endpoints

| Methode | Route | Beschreibung |
|---------|-------|-------------|
| GET | `/api/health` | Health Check |
| POST | `/api/contact` | Angebotsanfrage speichern + E-Mail + CRM |
| POST | `/api/leads` | Newsletter-Lead erfassen |

### POST /api/contact – Request Body

```json
{
  "name": "Max Mustermann",
  "email": "max@beispiel.de",
  "phone": "+49123456789",
  "inquiryType": "duschkabine",
  "widthCm": 120,
  "heightCm": 200,
  "message": "Ich interessiere mich für eine rahmenlose Duschkabine.",
  "privacyConsent": true
}
```

---

## E-Mail testen (Mailtrap)

1. Kostenlosen Account bei [mailtrap.io](https://mailtrap.io) erstellen
2. SMTP-Credentials in `.env` eintragen
3. Formular absenden → E-Mail in Mailtrap-Inbox prüfen

---

## Deployment

| Service | Zweck |
|---------|-------|
| Vercel / Netlify | Frontend (kostenlos, CI/CD) |
| Railway / Render | Backend (kostenlos-Tier verfügbar) |
| Cloudflare | CDN + SSL + DNS |

### Frontend auf Vercel

```bash
cd frontend
npm run build
# Vercel-Projekt erstellen und build/dist hochladen
```

### Backend-Umgebungsvariablen

Alle `.env`-Variablen in der Hosting-Plattform als Environment Variables eintragen.

---

## Checkliste vor Go-Live

- [ ] Echte Firmenadaten in `frontend/index.html` (JSON-LD) eintragen
- [ ] Firmenadaten in `Footer.jsx` und `Contact.jsx` aktualisieren
- [ ] Bilder in `frontend/public/assets/images/` hochladen
- [ ] `CORS_ORIGIN` auf echte Domain setzen
- [ ] E-Mail-Konfiguration mit echtem Mailserver testen
- [ ] Impressum- und Datenschutz-Seiten ausfüllen
- [ ] SSL-Zertifikat aktiv
- [ ] Google Search Console einrichten
- [ ] Lighthouse Audit: Performance >90, SEO >90, Accessibility >90

---

## DSGVO

- Kontaktformular: DSGVO-Checkbox erforderlich – Formular kann ohne Zustimmung nicht abgesendet werden
- CRM-Sync: Nur wenn `privacyConsent: true`
- Cookie-Banner: `react-cookie-consent` integriert
- Datenschutzerklärung: Seite unter `/datenschutz` anlegen (Inhalt: Rechtsanwalt beauftragen)
- Impressum: Seite unter `/impressum` anlegen

---

## Branding

| Element | Wert |
|---------|------|
| Primärfarbe | `#1A3C5E` Dunkelblau |
| Akzentfarbe | `#C8A96E` Gold |
| Hintergrund | `#F8F9FA` Hellgrau |
| Headline-Font | Playfair Display |
| Body-Font | Inter |
