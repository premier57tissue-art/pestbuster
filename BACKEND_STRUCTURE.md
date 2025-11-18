# 📁 Struktur Backend - Penjelasan

## 🎯 Kenapa Tiada `index.js` atau `server.js`?

Backend ini guna **TypeScript**, bukan JavaScript biasa. Jadi:

- ❌ **Tiada** `index.js` atau `server.js`
- ✅ **Ada** `src/app.ts` (ini adalah entry point)
- ✅ Selepas build, akan jadi `dist/app.js`

---

## 📂 Struktur Folder

```
pestbuster/
├── src/                    ← Source code (TypeScript)
│   ├── app.ts             ← ENTRY POINT (seperti index.js)
│   └── routes/
│       └── toyyibpay.ts   ← Payment routes
├── dist/                   ← Compiled code (JavaScript) - auto-generated
│   ├── app.js             ← Compiled dari app.ts
│   └── routes/
│       └── toyyibpay.js   ← Compiled dari toyyibpay.ts
├── package.json            ← Dependencies & scripts
├── tsconfig.json           ← TypeScript config
└── .env.example           ← Environment variables template
```

---

## 🔄 Cara Kerja

### 1. Development (Local)
```bash
npm run dev
```
- Run `src/app.ts` terus (guna `tsx`)
- Tiada perlu build

### 2. Production (Render)
```bash
npm run build    # Compile TypeScript → JavaScript (dalam dist/)
npm run start    # Run dist/app.js
```

**Render akan:**
1. Run `npm install` - install dependencies
2. Run `npm run build` - compile TypeScript ke `dist/`
3. Run `npm run start` - run `dist/app.js`

---

## 📝 File Penting

### `src/app.ts` = Entry Point
- Ini adalah "server" file
- Seperti `index.js` atau `server.js` dalam JavaScript
- Berfungsi sebagai main file

### `package.json`
- Script `start`: `node dist/app.js`
- Ini yang Render akan run selepas build

### `tsconfig.json`
- Config untuk TypeScript
- Tentukan output ke `dist/`

---

## ✅ Kesimpulan

**Tiada `index.js` atau `server.js` kerana:**
- ✅ Guna TypeScript (`.ts` files)
- ✅ Entry point = `src/app.ts`
- ✅ Selepas build = `dist/app.js` (auto-generated)
- ✅ Render akan build dan run `dist/app.js`

**Ini adalah struktur yang BETUL! ✅**

