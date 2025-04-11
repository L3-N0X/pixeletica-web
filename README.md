# Pixeletica Web

A web application for converting images to Minecraft block art and exploring them via an interactive map viewer.

## Features

- Convert images to Minecraft block art with different dithering algorithms
- Generate schematics for Minecraft building
- Interactive web map viewer for exploring pixel art
- Zoom, pan, and examine block details
- Dark theme interface with serif fonts

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pixeletica-web.git
   cd pixeletica-web
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn
   ```

3. Start development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser:
   ```
   http://localhost:3000
   ```

## Project Structure

```
pixeletica-web/
├── src/
│   ├── assets/           # Static assets
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── theme/            # Theme configuration
│   ├── App.tsx           # Main App component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── index.html            # HTML entry point
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Backend Integration

The frontend integrates with a Python backend API that handles image processing and conversion. Check the API documentation in `/backend-api-docs.md`.

## Docker Support

The application is configured for Docker deployment. See `Dockerfile` and `docker-compose.yml` for details.

## License

[MIT](LICENSE)
