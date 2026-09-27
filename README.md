<div align="center">

# 🌐 Travelsomnia

*A smart travel alarm that helps you never miss your stop. Built with React.*

![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB&style=flat-square) ![GitHub Stars](https://img.shields.io/github/stars/anirudhajikumar/travelsomnia?style=flat-square&logo=github) ![GitHub Forks](https://img.shields.io/github/forks/anirudhajikumar/travelsomnia?style=flat-square&logo=github)

[View Demo](https://github.com/anirudhajikumar/travelsomnia) · [Report Bug](https://github.com/anirudhajikumar/travelsomnia/issues/new?labels=bug) · [Request Feature](https://github.com/anirudhajikumar/travelsomnia/issues/new?labels=enhancement)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)
- [License](#license)

---

## 📖 Overview

travelsomnia A location-based travel alarm that helps you notice your stop.

A smart travel alarm that helps you never miss your stop. Built with React.

The project is built with React, Tailwind CSS, TypeScript and Vite, offering a modern and responsive user experience. It is designed to be easy to set up locally and straightforward to deploy to a production environment.

Haversine distance between two geographic coordinates. Returns distance in metres. The codebase defines a class `AlertsManager`. Key functions include `toRad`, `calculateDistance`, `formatDistance`, and `calculateBearing`, `distanceLabel`. Third-party integrations detected: `type`.

## ✨ Features

- **Built with React for a fast, reactive user experience**
- **Type-safe** — Full TypeScript coverage with strict mode enabled
- **Polished UI** — Tailwind CSS for a consistent design system
- **Object-oriented design** — Core classes: `AlertsManager`
- **6 public functions / handlers** — including `toRad`, `calculateDistance`, `formatDistance` and 3 more — covering the core logic of the project
- **Key integrations** — actively imports `type`, indicating built-in support for those libraries

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Structure** | `TypeScript` | Static type checking across the entire codebase |
| **Structure** | `JavaScript` | Core scripting language for application logic and interactivity |
| **Structure** | `HTML` | Semantic markup and application UI structure |
| **Structure** | `CSS` | Styling, layout, animations, and responsive design |
| **Framework** | `React` | Component-based UI library for reactive web interfaces |
| **Tooling** | `Tailwind CSS` | Utility-first CSS framework for rapid UI development |
| **Tooling** | `TypeScript` | Static type checking across the entire codebase |
| **Tooling** | `Vite` | Next-generation frontend build tool and dev server |
| **Package Manager** | `npm` | Dependency installation and script running |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x — [nodejs.org](https://nodejs.org/)

## 📥 Installation

**1. Clone the repository**

```bash
git clone https://github.com/anirudhajikumar/travelsomnia.git
cd travelsomnia
```

**2. Install dependencies**

```bash
npm install
```

## ▶️ Usage

1. **Start the application**

   ```bash
   npm run dev
   ```

   ```bash
   npm run build
   ```

   ```bash
   npm run preview
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

---

## 🌐 Deployment

### Frontend

- **Vercel** — zero-config, connect your repo and deploy
- **Netlify** — `netlify deploy --prod`
- **Cloudflare Pages** — excellent for static and edge-rendered apps

---

## 📂 Project Structure

```
./
├── .gitignore
├── README.md
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── public/
│   ├── favicon.svg
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── AlarmBorder.tsx
│   │   ├── AlarmSetup.tsx
│   │   ├── ArrivalOverlay.tsx
│   │   ├── JourneyView.tsx
│   │   ├── MapView.tsx
│   │   ├── PrivacyPolicy.tsx
│   │   ├── SearchOverlay.tsx
│   ├── hooks/
│   │   ├── useAppState.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── services/
│   │   ├── alarm.ts
│   │   ├── alerts.ts
│   │   ├── distance.ts
│   │   ├── geocoding.ts
│   │   ├── location.ts
```

### File Responsibilities

| File | Role |
| :--- | :--- |
| `index.html` | Serves as the main HTML5 application entry point. It declares the static DOM structure, wraps responsive cards, mounts the core design elements, and imports stylesheets and scripts. |
| `package.json` | Defines the project metadata for Node environments. It manages external dependencies, defines scripts (dev, build, start), and locks engine versions. |
| `tsconfig.json` | Configures compiler behaviors for TypeScript. It enforces strict type checks, configures build target platforms, and configures path aliases. |
| `vite.config.ts` | Provides type-safe configuration specifications for Vite. It handles JSX transpilation rules, production bundler parameters, and type checks. |
| `tailwind.config.js` | Customizes the Tailwind CSS framework tokens. It declares content-matching directories, custom color schemes, layout breakpoints, and utility classes. |

---

## 🐛 Troubleshooting

<details>
<summary><strong>Blank output or CORS error when opening `index.html` directly</strong></summary>

Browsers block certain API calls when a page is opened from the file system (`file://`). Serve the project locally instead:
  ```bash
  python -m http.server 8080
  # then open http://localhost:8080
  ```

</details>

<details>
<summary><strong>`npm install` fails with peer dependency errors</strong></summary>

Ensure you are running **Node.js ≥ 18**. Try clearing the cache:
  ```bash
  npm cache clean --force
  ```

</details>

> [!TIP]
> Still stuck? [Open an issue](https://github.com/anirudhajikumar/travelsomnia/issues/new) on the repository to get help.

---

## 🗺️ Roadmap

- [x] Initial release
- [ ] User authentication & account management
- [ ] Dark/light mode toggle
- [ ] Accessibility (WCAG 2.1 AA) audit and fixes
- [ ] Internationalisation (i18n) support
- [ ] Test suite with >80% coverage
- [ ] CI/CD pipeline with GitHub Actions

See [open issues](https://github.com/anirudhajikumar/travelsomnia/issues) for a full list of proposed features and known bugs.

---

## 🤝 Contributing

Contributions make the open-source community a better place — thank you!

1. **Fork** the repository
2. **Create** a feature branch — `git checkout -b feat/your-feature-name`
3. **Commit** your changes — `git commit -m 'feat: add your feature'`
4. **Push** to the branch — `git push origin feat/your-feature-name`
5. **Open** a Pull Request and describe what you've done

> [!TIP]
> Run `npm run lint` and `npm run type-check` before submitting your PR to catch issues early.

---

## 🙏 Acknowledgements

This project is built on top of excellent open-source work:

- [React](https://react.dev/) — The library for web and native user interfaces
- [Tailwind CSS](https://tailwindcss.com/) — A utility-first CSS framework
- [Vite](https://vitejs.dev/) — Next generation frontend tooling

---

## 📄 License

This project does not currently specify a license. Contact the author for usage permissions.

---

<div align="center">

Made with ❤️ by [anirudhajikumar](https://github.com/anirudhajikumar)

⭐ **If this project helped you, please give it a star!**

</div>
