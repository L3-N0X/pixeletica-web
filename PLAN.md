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
   - Define types based on API OpenAPI specification
   - `TaskResponse`, `FileInfo`, `MapInfo`
   - `ConversionRequest` and related settings types

## Phase 2: Application Routing Structure

5. Create the application routing structure:
   - Homepage (`/`) - Overview and starting point
   - Create new conversion page (`/create`)
   - Conversion status page (`/status/:taskId`) - For tracking conversion progress
   - Map viewer page (`/map/:mapId`) - For viewing completed conversions
   - Error and not found pages

6. Implement layout components:
   - App shell with navigation
   - Common header and footer
   - Toast notification system for errors and success messages

7. Create API service:
   - Implement functions that match the OpenAPI specification
   - Set up request and response handling with proper error management
   - Create TypeScript interfaces that match API schemas

## Phase 3: Image Upload and Conversion

8. Build the create conversion page:

   - Implement drag-and-drop image upload with preview
   - Create forms for configuring:
     - Dithering algorithm (`floyd_steinberg`, `ordered`, `random`)
     - Output dimensions (width/height)
     - Export settings (file types, grid lines, etc.)
     - Schematic settings (name, author, description)

9. Implement the conversion submission flow:
   - Convert image to base64 as required by the API
   - Submit to `/conversion/start` endpoint
   - Handle the response (which contains the task ID)
   - Redirect to status page with task ID in URL (`/status/:taskId`)

10. Create the conversion status tracking page:
    - Poll the `/conversion/{task_id}` endpoint to check progress
    - Display progress with visual indicators
    - Handle different status states (`queued`, `processing`, `completed`, `failed`)
    - Provide cancel option using the DELETE endpoint
    - Automatically redirect to map viewer when completed

## Phase 4: Result Preview and Download

11. Implement conversion results preview:
    - Fetch available files using `/conversion/{task_id}/files` endpoint
    - Display thumbnails and previews for different result types (dithered, rendered)
    - Group files by category for better organization

12. Create the file download functionality:
    - Individual file downloads using `/conversion/{task_id}/files/{file_id}`
    - Batch download options using `/conversion/{task_id}/download`
    - Selective download using POST endpoint with file IDs
    - Add download progress indicators

13. Implement map viewing redirection:
    - Add button to view the map in the interactive viewer
    - Use the task ID as the map ID for the map viewer URL
    - Redirect to `/map/:mapId` where mapId is the task ID

## Phase 5: Map Listing and Management

14. Create the homepage with map listing:
    - Fetch available maps from `/api/maps.json` endpoint
    - Display thumbnails and metadata for each map
    - Provide quick access to create new conversions
    - Add sorting and filtering options

15. Implement map management features:
    - Delete maps using the task deletion endpoint
    - Add favorite/star feature (stored in local storage)
    - Recent maps history

## Phase 6: Map Viewer Implementation

16. Create the base map viewer component:
    - Set up the route with URL parameter for map ID: `/map/:mapId`
    - Load map metadata from `/api/map/{map_id}/metadata.json`
    - Initialize transformation wrapper with proper settings

17. Implement the tile loading system:
    - Create a tile calculation engine to determine visible tiles based on zoom level
    - Use the `/api/map/{map_id}/tiles/{zoom}/{x}/{y}.png` endpoint to load tiles
    - Implement viewport calculation to only load visible tiles
    - Add loading states and placeholders

18. Implement the canvas-based grid overlay:
    - Create drawing functions for block and chunk grids
    - Align grid with the coordinate system from metadata
    - Add different colors for block and chunk lines

19. Add interactivity to the map viewer:
    - Implement hover and selection functionality
    - Create the detail panel to show block and chunk information
    - Add zoom control buttons and reset view functionality
    - Implement keyboard shortcuts for navigation

## Phase 7: URL Sharing and State Management

20. Implement URL state management:
    - Store current view position and zoom level in URL query parameters
    - Enable direct sharing of specific map views
    - Add "Copy share link" button to generate a URL with current viewport
    - Restore view from URL parameters when loading page

21. Create deep-linking functionality:
    - Add the ability to link directly to specific blocks or chunks
    - Implement URL format for coordinates: `/map/:mapId?x=123&y=456&zoom=2`
    - Generate bookmark links for interesting locations

## Phase 8: Optimization and Performance

22. Implement performance optimizations:
    - Use React.memo for tile components to prevent unnecessary re-renders
    - Add tile caching to prevent reloading already visible tiles
    - Implement progressive loading for different zoom levels
    - Use requestAnimationFrame for smooth canvas rendering
    - Add debouncing for viewport calculations during panning

23. Improve user experience:
    - Add loading indicators and transitions
    - Implement error boundary components
    - Create fallback UI for missing tiles or data
    - Add helpful tooltips and onboarding guidance

24. Create responsive design:
    - Adjust UI for different screen sizes
    - Optimize touch interactions for mobile devices
    - Create collapsible panels for small screens
    - Ensure accessibility compliance

## Phase 9: Docker Integration

25. Configure Docker integration:
    - Set up proper environment variable handling
    - Configure API base URL for different environments
    - Set up production build process with Docker
    - Ensure proper asset paths for Docker deployment

26. Implement volume mounting configuration:
    - Set up correct paths for accessing files from Docker volume
    - Configure the app to handle Docker volume structures
    - Test file access from mounted volumes

## Phase 10: Testing and Documentation

27. Create documentation:
    - Add comprehensive README with setup instructions
    - Document component structure and API
    - Create user guide with tutorials
    - Add developer documentation for future contributors

This implementation plan now correctly integrates with the provided API endpoints, creates a proper URL structure for sharing, and implements the full workflow from image upload to interactive map viewing.