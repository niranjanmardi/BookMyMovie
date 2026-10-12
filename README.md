# BookMyMovie 🎬

> **Unit 4 – Experiment 1**: Movie Ticket Booking Web Application with REST API Integration  
> Developed using React 19, React Router 7, Native Fetch API, and a custom Cinema Dark Charcoal Design System.

---

## 📌 Project Overview

**BookMyMovie** is an interactive movie ticket booking web application. Building upon the Unit 3 routing, state management, and authentication architecture, Unit 4 Experiment 1 integrates **asynchronous REST API communication**, dynamic movie search, genre filtering, rich movie details, loading skeletons, and robust error handling with automatic fallback capabilities.

---

## 🎨 1. Professional Cinema UI Redesign

- **Color Palette**: Cinema dark charcoal background (`#101115` / `#171920`), clean off-white typography (`#f3f4f6`), and a restrained red accent (`#e50914` / `#dc2626`).
- **Production Navigation Bar**: BookMyMovie logo, Home, Movies, My Bookings, and dynamic auth links (Login, Register, User Chip, and Logout).
- **Hero Section**: Dynamic featured cinema presentation highlighting ratings, synopsis, and quick actions ("Browse All Movies", "Book Featured Movie").
- **Consistent Grid & Posters**: Responsive movie cards with 2:3 aspect ratio posters, gold rating badges (`★`), release year, genre tags, and quick action buttons.
- **Micro-Interactions**: Smooth card lifts, subtle borders, and focused states without excessive animations or AI-generated clutter.
- **Responsive**: Fully responsive across desktop, tablet, and mobile viewport sizes.

---

## 🌐 2. REST API Integration (`src/services/movieApi.js`)

The application integrates real asynchronous API communication using modern JavaScript `async/await` and the native `fetch` API with request cleanup via `AbortController`.

- **Primary Live API**: [TVMaze REST API](https://api.tvmaze.com)
  - `GET /shows?page=0` - Retrieves curated popular titles.
  - `GET /search/shows?q={query}` - Dynamic search by movie title.
  - `GET /shows/{id}` - Dynamic movie details by unique API ID.
  - *No private API keys required, CORS-enabled, 100% public.*
- **Optional TMDB API Support**: Documented in `.env.example`. Can be enabled by adding `VITE_TMDB_API_KEY` to `.env.local`.
- **Local Demo Fallback**: Rich offline fallback dataset containing blockbuster movie metadata (Avengers: Doomsday, Ramayana: Part 1, Dune: Part Three, Jailer 2, etc.) with local poster assets from `public/posters/`. The service automatically falls back if network connectivity fails.
- **Race Condition Prevention**: Employs `AbortController` in search and details effects to cancel stale in-flight requests and avoid race conditions.

---

## 🧩 3. Reusable Components

| Component | File Path | Description |
| :--- | :--- | :--- |
| `MovieCard` | [MovieCard.jsx](file:///src/components/MovieCard.jsx) | Renders poster, title, rating badge, year, genres, and actions. |
| `MovieList` | [MovieList.jsx](file:///src/components/MovieList.jsx) | Renders movie collection with loading skeletons, error state, and empty state. |
| `SearchBar` | [SearchBar.jsx](file:///src/components/SearchBar.jsx) | Controlled search input with icon and one-click clear button. |
| `GenreFilter` | [GenreFilter.jsx](file:///src/components/GenreFilter.jsx) | Interactive genre pill filters with "All Genres" support. |
| `Loading` | [Loading.jsx](file:///src/components/Loading.jsx) | Cinema shimmer skeletons (grid & details) and cinema spinner. |
| `ErrorMessage` | [ErrorMessage.jsx](file:///src/components/ErrorMessage.jsx) | Clean error card with description and action-oriented Retry button. |
| `EmptyState` | [EmptyState.jsx](file:///src/components/EmptyState.jsx) | Zero-results state with one-click "Reset Filters" action. |
| `Header` | [Header.jsx](file:///src/components/Header.jsx) | Navigation bar with auth status and "My Bookings" link. |
| `Footer` | [Footer.jsx](file:///src/components/Footer.jsx) | Cinema branding and experiment details. |

---

## 🚀 4. Application Routes

- `/` – **Home Page**: Hero section with featured movie, trending titles preview, and feature highlights.
- `/movies` – **Movies Catalog**: Live API search, genre filter pills, live API status indicator, and movie collection.
- `/movies/:id` – **Dynamic Movie Details**: Dynamic API fetch by ID, synopsis, specs (rating, runtime, language, release date), and "Book Tickets" CTA.
- `/booking` – **Seat Booking**: Selected movie banner, multiplex selection, show timing, date selection, interactive seat grid (A1–D6), and price calculations.
- `/summary` – **Booking Summary & Digital Ticket**: Confirmed digital ticket admission pass; also accessible via **My Bookings**.
- `/login` & `/register` – **Authentication**: Unit 3 user registration and login with validation and session management.

---

## 💻 5. Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation & Execution
```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Build for production
npm run build

# 4. Run ESLint check
npm run lint
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Demo Credentials
- **Username**: `admin`
- **Password**: `1234`
- *Or register a new account via the Register page.*
