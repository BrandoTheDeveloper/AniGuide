# AniGuide

A production-ready Progressive Web App for anime discovery, reviews, and watchlist management. Built with React, Express.js, and PostgreSQL, featuring full Google Play Store compatibility via Android TWA.

---

## Features

- **Anime Discovery**: Browse trending, popular, airing, and top-rated anime from AniList
- **User Authentication**: Secure login system with Replit Auth integration  
- **Review System**: Write and read reviews with season/episode tracking
- **Watchlist Management**: Add anime to favorites with status tracking and ratings
- **PWA Support**: Full offline functionality and installable on mobile devices
- **Google Play Ready**: Android TWA compatible for Play Store deployment
- **Real-time Updates**: Automatic anime data refresh every 30 minutes
- **Guest Browsing**: Discover anime without authentication, with protected features for logged-in users

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, PostgreSQL, Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **External APIs**: AniList GraphQL API
- **PWA**: Service Worker, Web Manifest, Background Sync
- **Deployment**: Replit, with Android TWA support for Google Play

## Android Deployment

AniGuide is fully compatible with Android TWA for Google Play Store deployment:

```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://aniguide.onrender.com/manifest.json
bubblewrap build --release
```

See `ANDROID_DEPLOYMENT.md` for complete deployment guide.

## Recent Updates

- **Android TWA Compatibility**: Fixed all compatibility issues for Google Play Store deployment
- **Service Worker Optimization**: Resolved external image loading conflicts while maintaining offline functionality  
- **PWA Manifest Validation**: Corrected manifest configuration for PWA Builder compliance
- **Production Deployment**: Comprehensive HTTPS and security configuration ready for production use

## Documentation

- `COMMIT_MESSAGE.md` - Detailed commit message for Android TWA fixes
- `ANDROID_DEPLOYMENT.md` - Complete guide for Google Play Store deployment
- `replit.md` - Project architecture and development history

---

## 🧰 Tech Stack
- ⚛️ React + Vite
- 🎨 Tailwind CSS (if used)
- 🔗 react-router-dom
- 🌍 Render for deployment
- 🛠️ Vite Plugin PWA

---

## 🛠️ Installation

Clone the repo and run it locally:

```bash
git clone https://github.com/BrandoTheDeveloper/AniGuide.git
cd AniGuide
npm install
npm run dev
````

---

## 📦 Deployment

Hosted live on:
🌐 [https://aniguide.onrender.com](https://aniguide.onrender.com)

---

## 🧾 License

🆓 MIT — use it freely!

---

## 🤝 Contributing

Got ideas? Found a bug? Want to help?
Feel free to open an issue or submit a pull request 🚀

---

## 📸 Screenshots

*(Add screenshots here if you want to show off the UI)*

```

Let me know if you want me to actually add this to your GitHub `README.md`, or if you want to include some badges (build status, license, etc.).
```
