# HiSMaComp

An interactive historical map visualization application that displays European city populations across different centuries (800-1750 AD). Built to help visualize and explore historical research data with dynamic data layers, timeline controls, and responsive design.

## 📖 About

HiSMaComp is a modern web application designed to visualize historical demographic data through an interactive map interface. The project serves as a tool for researchers, educators, and history enthusiasts to explore how European settlements evolved from the early Middle Ages through the Renaissance period.

### Key Capabilities

The application processes historical town data spanning from 800 AD to 1750 AD, filtering and visualizing settlements based on their documented existence and population during specific time periods. The map dynamically adjusts to show only relevant towns for the selected century, with marker sizes reflecting relative population levels.

## 🚀 Live Demo

**[View Live Application](https://a-a-m-k.github.io/HiSMaComp/)**

## ✨ Key Features

- **Interactive Timeline**: Navigate through 8 centuries (800-1750 AD) with a responsive slider
- **Dynamic Data Visualization**: Town markers sized by population with color-coded legend
- **Responsive Design**: Optimized layouts for mobile, tablet, and desktop devices
- **Smart Zoom Calculations**: Automatic zoom adjustment ensures all towns are visible across screen sizes
- **Screenshot Export**: Save map visualizations as PNG images
- **PWA Support**: Service worker for offline capability and improved performance
- **Error Handling**: Comprehensive error boundaries with user-friendly recovery options

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Mapping**: MapLibre GL JS, React Map GL
- **UI Framework**: Material-UI (MUI) v6
- **Testing**: Vitest, React Testing Library, Playwright
- **Code Quality**: ESLint, Prettier, Husky, lint-staged
- **CI/CD**: GitHub Actions, Automated Testing & Deployment

## 🏗️ Architecture

### Project Structure

```
src/
├── components/        # React components
│   ├── controls/      # Timeline, Legend, Screenshot
│   ├── map/          # MapView and MapLayer
│   ├── ui/           # Reusable UI components
│   └── dev/          # Dev tools (ErrorBoundary, PerformanceMonitor)
├── context/          # React Context (AppContext)
├── hooks/            # Custom React hooks
├── services/         # Business logic (YearDataService with caching)
├── utils/            # Utility functions (zoom calculations, GeoJSON conversion)
├── constants/        # Configuration constants
└── theme/            # MUI theme configuration
```

### Key Design Decisions

1. **Context API for State Management**: Chose Context API over Redux for simpler state needs
2. **Service Layer with Caching**: YearDataService caches processed data to avoid redundant calculations
3. **Responsive Zoom Algorithm**: Custom algorithm using Mercator projection for accurate geographic calculations
4. **Component Composition**: Barrel exports and clear component boundaries for maintainability
5. **Type Safety**: Full TypeScript implementation with strict type checking

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- A Stadia Maps API key (get one at [https://client.stadiamaps.com/](https://client.stadiamaps.com/))

### Setup

1. Clone the repository:

```bash
git clone https://github.com/a-a-m-k/HiSMaComp.git
cd HiSMaComp
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

4. Add your Stadia Maps API key to `.env`:

```env
VITE_STADIA_API_KEY=your-stadia-maps-api-key-here
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser

### Deploying to GitHub Pages

For GitHub Pages deployment, the API key is injected during the build process via GitHub Actions using secrets.

#### Step-by-Step: Adding GitHub Secret

1. **Navigate to your repository on GitHub**
   - Go to: `https://github.com/a-a-m-k/HiSMaComp`

2. **Open Settings**
   - Click on the **Settings** tab (top navigation bar)

3. **Go to Secrets**
   - In the left sidebar, click **Secrets and variables**
   - Then click **Actions**

4. **Add New Secret**
   - Click the **New repository secret** button (top right)

5. **Enter Secret Details**
   - **Name**: `VITE_STADIA_API_KEY` (must match exactly, case-sensitive)
   - **Secret**: Paste your Stadia Maps API key (e.g., `your-stadia-maps-api-key-here`)
   - Click **Add secret**

6. **Verify Secret is Added**
   - You should see `VITE_STADIA_API_KEY` in the list of secrets
   - The value will be hidden (showing only `••••••••`)

7. **Deploy**
   - Push any commit to the `main` branch
   - GitHub Actions will automatically:
     - Build the project with your API key
     - Deploy to GitHub Pages
   - Check the **Actions** tab to see the deployment progress

#### Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
gh secret set VITE_STADIA_API_KEY --repo a-a-m-k/HiSMaComp
# When prompted, paste your API key
```

> **Note**: The API key is never committed to version control. It's only used during the build process and embedded in the compiled JavaScript bundle (which is public for client-side apps).

## 📝 Available Scripts

| Script                  | Description                       |
| ----------------------- | --------------------------------- |
| `npm run dev`           | Start development server          |
| `npm run build`         | Build for production              |
| `npm run test`          | Run tests in watch mode           |
| `npm run test:run`      | Run all tests                     |
| `npm run test:coverage` | Run tests with coverage report    |
| `npm run test:e2e`      | Run end-to-end tests (Playwright) |
| `npm run lint`          | Run linting (pre-commit hook)     |
| `npm run deploy`        | Deploy to GitHub Pages            |
| `npm run perf:audit`    | Run Lighthouse performance audit  |

## 🧪 Testing

- **Unit Tests**: 85+ tests covering utilities, components, and hooks
- **E2E Tests**: Playwright tests for visual regression and user interactions
- **Test Coverage**: Comprehensive coverage of core functionality
- **CI Integration**: Tests run automatically on every push/PR

**Test Results**: All 85 unit tests passing ✅

> **Note**: Test coverage metrics are tracked in CI. Run `npm run test:coverage` locally to see detailed coverage reports.

![Test Coverage](https://img.shields.io/badge/coverage-85%2B%20tests-green)

## 📊 Performance Metrics

- **Bundle Size**: ~1.5MB total (optimized with code splitting)
  - Main bundle: ~71KB gzipped
  - MapLibre: ~248KB gzipped
  - Vendor: ~155KB gzipped
- **Build Time**: ~19s
- **Lighthouse**: Performance monitoring integrated (run `npm run perf:audit`)

## 🔄 CI/CD

This project uses GitHub Actions for automation:

- **✅ Simple CI**: Run tests and build on every push/PR
- **🚀 Auto Deploy**: Deploy to GitHub Pages on main branch

### Status Badges

![Simple CI](https://github.com/a-a-m-k/HiSMaComp/workflows/Simple%20CI/badge.svg)
![Simple Deploy](https://github.com/a-a-m-k/HiSMaComp/workflows/Simple%20Deploy/badge.svg)

## 📄 License

This project is open source. Map data attribution:

- © Stadia Maps
- © Stamen Design
- © OpenMapTiles
- © OpenStreetMap
