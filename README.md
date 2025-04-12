# Pixeletica Web

A web application for converting images to Minecraft block art and exploring them via an interactive map viewer.

## Features

- Convert images to Minecraft block art with different dithering algorithms
- Generate schematics for Minecraft building
- Interactive web map viewer for exploring pixel art
- Zoom, pan, and examine block details
- Dark theme interface with serif fonts
- URL-based sharing for map views and coordinates
- Bookmark interesting locations and views

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

## URL Sharing

The application supports sharing specific map views via URL parameters:

- `/map/:mapId` - Base URL for viewing a map
- `?x=123&y=456` - Specify the center position coordinates
- `?zoom=2` - Set the zoom level (e.g., 2 = 200% zoom)
- `?blockId=abc123` - Pre-select a specific block
- `?chunkX=5&chunkZ=10` - Pre-select a specific chunk

Example: `http://localhost:3000/map/abc123?x=150&y=-200&zoom=2.5&blockId=block_5_10`

## Backend Integration

The frontend integrates with a Python backend API that handles image processing and conversion. Check the API documentation in `/backend-api-docs.md`.

## Docker Deployment

Pixeletica is designed to be easily deployed using Docker. The repository includes:

- `Dockerfile`: Multi-stage build for optimized images
- `docker-compose.yaml`: Ready-to-use deployment configuration
- Environment variable support for customization

### Quick Start with Docker

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pixeletica-web.git
   cd pixeletica-web
   ```

2. Build and run the Docker container:
   ```
   docker-compose up --build
   ```

3. Access the application in your browser:
   ```
   http://localhost:3000
   ```

## License

[MIT](LICENSE)
