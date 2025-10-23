# IDS Frontend

React frontend for the AI Implementation Designer application.

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run lint` - Runs ESLint to check code quality
- `npm run lint:fix` - Fixes auto-fixable ESLint issues

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── Button.js
│   │   ├── Input.js
│   │   ├── Select.js
│   │   ├── Modal.js
│   │   └── Spinner.js
│   └── layout/          # Layout components
│       ├── Header.js
│       ├── Sidebar.js
│       └── PageWrapper.js
├── features/
│   ├── workspaces/      # Workspace management
│   ├── documents/       # Document upload
│   └── viewer/          # SoW viewer
├── contexts/            # React Context
├── services/            # API services
├── App.js
└── index.js
```

## Design System

This application follows Material Design 3 dark mode principles.

### Color Palette
- Base: #0D0D0D
- Surface: #1A1A1A
- Accent: #C82FFF
- Text: #FFFFFF
- Border: #A8A8A8

### Typography
- Font Family: Montserrat
- Weights: 400 (Regular), 500 (Medium), 600 (Semi-bold)

### Icons
- Library: Material Symbols Outlined
- Weight: 200

## Code Quality

- ESLint configuration enforces:
  - Complexity ≤ 10
  - Function length ≤ 75 lines
  - Max statements ≤ 120
  - Line length ≤ 120 characters

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

