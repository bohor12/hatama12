# Slovenia Dating App 🇸🇮

Spletna aplikacija za spoznavanje ljudi v Sloveniji, zgrajena z Next.js, Prisma in SQLite.

## Značilnosti

- 🔐 **Avtentikacija uporabnikov** - registracija, prijava, odjava
- 👤 **Uporabniški profili** - nastavitve profila, fotografije, opis
- 🔍 **Brskanje po uporabnikih** - iskanje uporabnikov glede na filter
- 💬 **Sporočila** - pošiljanje in prejemanje sporočil
- ❤️ **Interesi** - pošiljanje in odobravanje interesov
- 🏠 **Sobe** - prikazovanje sob za pogovore
- 📢 **Oglasi** - objavljanje in brskanje po oglasih

## Tehnologije

- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Baza podatkov**: SQLite s Prisma ORM
- **Avtentikacija**: JWT tokens s httpOnly cookies
- **Ikone**: Lucide React

## Namestitev

### Predpogoji

- Node.js 20+ in npm
- Git

### Koraki za namestitev

1. **Kloniraj repository**
```bash
git clone <your-repo-url>
cd hatapa
```

2. **Namesti odvisnosti**
```bash
npm install --legacy-peer-deps
```

3. **Ustvari `.env` datoteko**
```bash
cp .env.example .env
```

4. **Generiraj Prisma Client**
```bash
npx prisma generate
```

5. **Zaženi migracije**
```bash
npx prisma migrate dev
```

6. **Zaženi development server**
```bash
npm run dev
```

Aplikacija bo dostopna na [http://localhost:3000](http://localhost:3000)

## Prisma Studio

Za upravljanje baze podatkov lahko uporabiš Prisma Studio:
```bash
npx prisma studio
```

## Struktura projekta

```
hatapa/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── about/            # About stran
│   ├── ads/              # Oglasi
│   ├── browse/           # Brskanje uporabnikov
│   ├── dashboard/        # Dashboard
│   ├── login/            # Prijava
│   ├── messages/         # Sporočila
│   ├── profile/          # Profil
│   ├── register/         # Registracija
│   └── rooms/            # Sobe
├── lib/                   # Utility funkcije
│   ├── permissions.ts    # JWT handling
│   └── prisma.ts         # Prisma klient
├── prisma/               # Prisma schema in migracije
│   ├── schema.prisma     # Baza podatkov schema
│   └── migrations/       # Migracije
└── public/               # Statične datoteke
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Registracija
- `POST /api/auth/login` - Prijava
- `POST /api/auth/logout` - Odjava

### Uporabniki
- `GET /api/user/me` - Pridobi podatke o trenutnem uporabniku
- `PUT /api/user/me` - Posodobi profil
- `GET /api/users/browse` - Brskanje po uporabnikih

### Interesi
- `POST /api/interest` - Pošlji interes
- `POST /api/interest/approve` - Odobri/zavrni interes

### Sporočila
- `POST /api/messages/send` - Pošlji sporočilo

### Oglasi
- `GET /api/ads` - Pridobi vse oglase
- `POST /api/ads` - Ustvari nov oglas

## Docker

Projekt vključuje Docker konfiguracijo:

```bash
docker-compose up
```

## Push na GitHub

Za objavo kode na GitHub:

1. **Ustvari nov repository na GitHubu** (brez README, .gitignore, ali license)

2. **Dodaj remote in pushaj**
```bash
git remote add origin https://github.com/TVOJ-USERNAME/hatapa.git
git branch -M main
git push -u origin main
```

3. **Deli URL z Julesom ali Gemini AI** za pomoč pri razvoju!

## Uporaba z AI asistenti (Jules, Gemini)

Ko deliš ta projekt z AI asistenti, jim lahko daš sledeče informacije:

- **Repository URL**: `https://github.com/TVOJ-USERNAME/hatapa`
- **Glavne tehnologije**: Next.js 15, Prisma, SQLite, TypeScript
- **Struktura baze**: Glej `prisma/schema.prisma`
- **API dokumentacija**: Glej API Endpoints zgoraj

## Development

```bash
# Zagon dev serverja
npm run dev

# Build production
npm run build

# Zagon production
npm start

# Linting
npm run lint

# Prisma Studio
npx prisma studio

# Nova migracija
npx prisma migrate dev --name naziv_migracije
```

## TODO / Naslednji koraki

- [ ] Implementacija real-time sporočil (WebSocket)
- [ ] Upload fotografij
- [ ] Napredno filtriranje uporabnikov
- [ ] Email verificiranje
- [ ] Password reset funkcionalnost
- [ ] Notifikacije
- [ ] Izboljšan UI/UX
- [ ] Unit in integration testi
- [ ] Deployment na produkcijo

## Prispevanje

Vsak je dobrodošel prispevati! Prosim ustvari pull request ali issue.

## Licenca

MIT
