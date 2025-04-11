# Frontend Implementation Plan for Pixeletica

## Phase 1: Project Setup

1. Create a new Vite project with React and TypeScript
   - Set up ESLint and Prettier for code quality
   - Configure the project structure with dedicated folders for components, hooks, and types

2. Install required dependencies:
   - `react-zoom-pan-pinch` for zoom/pan functionality
   - `axios` for API requests
   - `react-router-dom` for routing between different pixel art maps
   - `evergreen-ui` for UI components and theming

3. Define a solid dark theme:
   - Use Evergreen's theming capabilities to create a dark theme with serif fonts
   - Configure accent colors for a modern aesthetic (e.g., dark teal-greenish main accent, ...)
   - Ensure proper contrast for accessibility

4. Create basic types for your data structures:
   - `PixelArtMetadata` (includes tile and coordinate system details)
   - `ImageTile`
   - `Chunk`
   - `BlockDetails`

## Phase 2: Core Components Structure

5. Create the application routing structure:
   - Homepage listing all available pixel art maps
   - Dynamic routes for individual maps (`/map/:mapName`)
   - Detail panel component for block and chunk information

6. Implement the main `PixelArtViewer` component skeleton:
   - Container for the transformation wrapper
   - Placeholder for tile rendering
   - Canvas overlay for the grid
   - Controls for zoom in/out and reset

7. Create utility functions:
   - Zoom level calculations
   - Visible tile determination
   - Coordinate and chunk calculations
   - Metadata parsing for block and chunk details

## Phase 3: Data Loading

8. Create a data loading service that:
   - Fetches the list of available maps from `/api/maps.json`
   - Loads specific map metadata from `/api/map/{mapName}/metadata.json`
   - Implements caching for already loaded data

9. Implement the two-tier tile and metadata loading:
   - Load the full image at the initial zoom level (`/api/map/{mapName}/full-image.jpg`)
   - Dynamically load tiles based on zoom level and viewport (`/api/map/{mapName}/tiles/{zoom}/{x}/{y}.jpg`)

10. Parse metadata for:
    - Tile stitching and coordinate system
    - Block and chunk details
    - Origin and grid alignment

## Phase 4: Tiled Image Viewer Implementation

11. Implement the tile calculation logic:
    - Calculate current zoom level based on transformation scale
    - Determine which tiles are visible in the current viewport
    - Generate tile URLs based on zoom level, x, and y coordinates

12. Create the tile rendering component:
    - Implement efficient rendering with React `useMemo`
    - Add image loading states (placeholder while loading)
    - Configure proper pixel art rendering with CSS

13. Implement the dynamic tile loading system:
    - Load tiles only when they become visible
    - Implement proper loading/unloading as user pans
    - Add preloading for adjacent tiles for smoother panning

## Phase 5: Grid Overlay Implementation

14. Implement the canvas-based grid overlay:
    - Create drawing functions for the block grid (e.g., 16×16 blocks per chunk)
    - Add major grid lines for chunks
    - Ensure the grid aligns properly with the origin coordinates

15. Add grid interactivity:
    - Implement mouse position to block and chunk calculation
    - Add hover highlighting for blocks and chunks
    - Add selection functionality for blocks and chunks

16. Create the detail panel component:
    - Show information for the selected block and its chunk
    - Include block type, coordinates, and chunk coordinates
    - Style it properly with Evergreen and CSS
    - Add animations for panel appearance/disappearance

## Phase 6: Image Upload and Conversion

17. Implement an image upload and configuration interface:
    - Allow users to upload an image file
    - Provide fields for configuring conversion settings:
      - Dithering algorithm
      - Schematic settings (e.g., coordinate origin, name, description, author)
      - Image conversion settings (e.g., width, height, defaulting to original size/aspect ratio if missing)
      - Colors for inserted lines in the final images

18. Integrate with the Python backend:
    - Use the backend's OpenAPI documentation (to be added later) to configure API requests
    - Start the conversion process by sending the image and settings to the backend
    - Poll the backend for conversion results

19. Display conversion results:
    - Show different previews of the generated pixel art
    - Allow users to download the schematic and other generated files
    - Provide an option to load the result directly into the web map viewer for detailed exploration

## Phase 7: Optimization and Refinement

20. Implement performance optimizations:
    - Use `React.memo` for tile components to prevent unnecessary re-renders
    - Implement tile caching to prevent reloading of already seen tiles
    - Use `requestAnimationFrame` for smooth canvas rendering

21. Add user experience enhancements:
    - Smooth loading transitions between zoom levels
    - Loading indicators for both tiles and data
    - Error handling for missing tiles or data

22. Implement responsive design:
    - Adjust the viewer for different screen sizes
    - Create mobile-friendly controls
    - Handle touch events properly

## Phase 8: Docker Integration

23. Configure the application for Docker:
    - Create proper Vite build configuration
    - Set up correct asset paths for production builds
    - Configure the app to handle Docker volume paths

24. Test volume mounting:
    - Ensure the app can access all JSON data and images from the Docker volume
    - Verify dynamic loading works correctly with the volume structure

## Phase 9: Finalization and Testing

25. Implement final testing:
    - Write tests for critical components
    - Test zoom/pan functionality
    - Verify grid selection works correctly
    - Ensure block and chunk details load properly
    - Test the image upload and conversion workflow

26. Create production build optimizations:
    - Configure code splitting
    - Implement proper caching strategies
    - Minimize bundle size

27. Document the frontend application:
    - Create README with setup instructions
    - Document component structure
    - Add comments to complex functions

This plan now includes functionality for uploading images, configuring conversion settings, and integrating with a Python backend to generate pixel art results. The results can be explored in the web map viewer for building the pixel art in Minecraft block by block.