UI/UX Design Plan for Pixeletica


# Chakra UI v3 Documentation for LLMs

> Chakra UI is an accessible component system for building products with speed

## Documentation Sets

- [Complete documentation](chakra-v3-docs-borr8e9xb-chakra-ui.vercel.app/llms-full.txt): The complete Chakra UI v3 documentation including all components, styling and theming
- [Components](chakra-v3-docs-borr8e9xb-chakra-ui.vercel.app/llms-components.txt): Documentation for all components in Chakra UI v3.
- [Charts](chakra-v3-docs-borr8e9xb-chakra-ui.vercel.app/llms-charts.txt): Documentation for the charts in Chakra UI v3.
- [Styling](chakra-v3-docs-borr8e9xb-chakra-ui.vercel.app/llms-styling.txt): Documentation for the styling system in Chakra UI v3.
- [Theming](chakra-v3-docs-borr8e9xb-chakra-ui.vercel.app/llms-theming.txt): Documentation for theming Chakra UI v3.
- [Migrating to v3](chakra-v3-docs-borr8e9xb-chakra-ui.vercel.app/llms-v3-migration.txt): Documentation for migrating to Chakra UI v3.

## Notes

- The complete documentation includes all content from the official documentation
- Package-specific documentation files contain only the content relevant to that package
- The content is automatically generated from the same source as the official documentation


___

After analyzing the current frontend, I've identified several issues that need to be addressed to create a modern, user-friendly design that works well on both mobile and desktop devices.

Current Issues Identified
Layout Width Restriction: The website currently uses only 1/3 of the screen width due to a hard-coded max-width of 1280px in the CSS.
Navigation Bar Issues: The current navbar is minimal with inconsistent styling and no clear hierarchy.
Redundant Buttons: "Create New" appears in both the navbar and homepage with inconsistent functionality.
Lack of Visual Structure: Content is placed randomly without proper containment, alignment, or visual hierarchy.
Duplicate Branding: "Pixeletica" appears twice on the page without clear purpose.
Inconsistent Font Usage: Current implementation doesn't use serif fonts strategically.
Main Layout Structure
Here's my proposed layout structure for the application:

App Container (100% Width)

Header (Fixed Position)

Main Content Area (Flex, Dynamic Height)

Footer

Logo Area

Main Navigation

User Actions

Sidebar (Collapsible)

Content Area (Flex: 1)

Page Header

Page Content

Recent Maps

Favorites

Filters

Global Layout Design
Header (Top Navigation Bar)
Position: Fixed at top of viewport
Height: 64px on desktop, 56px on mobile
Width: 100% of viewport width
Background: Dark background with subtle gradient (#050a07 to #112218)
Shadow: Subtle drop shadow to elevate from content
Content Structure:
Left: Logo "Pixeletica" in serif font (Zodiak) as the brand identity
Center: Main navigation with sans-serif font for readability
Right: Action buttons including primary "Create New Pixel Art" button
Main Content Area
Width: 100% of viewport (with appropriate padding)
Structure: Two-column layout on desktop, single column stacking on mobile
Sidebar (220px width, collapsible on mobile):
Recent maps
Favorites
Filter options
Content Area (flex-grow: 1):
Page-specific content with consistent padding
Clear visual hierarchy with headings and sections
Footer
Height: Auto based on content
Background: Slightly lighter than main background (#112218)
Content: Copyright info, links, version information with sans-serif font
Typography System
Strategic Font Usage
Serif Fonts:

Zodiak: Used for main branding, page titles, and important headings (H1, H2)
Source Serif Pro: Used for section headings (H3, H4) and pull quotes
Sans Serif Fonts:

Used for body text, button labels, navigation, and UI elements
Improves readability for smaller text and dense information
Typography Hierarchy
Page Title: Zodiak, 32px/24px (desktop/mobile), weight 700
Section Headings: Zodiak, 24px/20px, weight 700
Subsection Headings: Source Serif Pro, 20px/18px, weight 600
Card Titles: Source Serif Pro, 18px/16px, weight 600
Body Text: Sans serif, 16px/14px, weight 400
UI Elements: Sans serif, various sizes, weight 400-600
Captions/Labels: Sans serif, 14px/12px, weight 400
Color Palette Extension
Building on the existing theme:

Primary: #92e8b8 (bright teal-green) - for primary actions and highlights
Secondary: #21835d (darker teal) - for secondary elements
Accent: #af8774 (warm terracotta) - for accent elements and contrast
Background Gradient: From #050a07 (darkest) to #112218 (slightly lighter)
Content Cards: #224430 (mid-dark green) with 1px #517b66 border
Text: #dde9e3 (off-white) for main text, #517b66 (muted green) for secondary text
Page-Specific Designs
Homepage Design
Hero Section:

Large welcome area with serif font heading "Welcome to Pixeletica"
Subheading in sans serif explaining the purpose
Primary CTA "Create New Pixel Art" button prominently displayed
Background showing subtle pixel art pattern or sample conversion
Recent Maps:

Grid layout with consistent card sizes
Cards have preview image, title, and quick actions
Clear visual separation between cards
Categories Section:

Tabs or filter options to browse different categories/tags
Visual indicators for selected filters
Create Page Design
Step-by-Step Process:
Clear numbered steps with progress indicator
Each step in its own card container
Image Upload Area:
Large drop zone with dashed border
Clear instructions and supported formats
Settings Panels:
Grouped settings in collapsible sections
Related options visually connected
Interactive previews where possible
Map Viewer Page
Control Panel:

Fixed position or collapsible sidebar
Tool selection clearly grouped by function
Viewing Area:

Maximized screen space for the map itself
Zoom controls in bottom right corner
Coordinates and information overlay
Details Panel:

Slide-in panel from right side
Tabbed interface for different information types
Responsive Design Approach
Desktop (1200px+): Full two-column layout with extended features
Tablet (768px-1199px): Adapted two-column layout with some features condensed
Mobile (320px-767px): Single column layout with:
Hamburger menu for navigation
Collapsible sections
Touch-optimized controls (larger hit areas)
Bottom navigation bar for main actions
Component Design
Cards
Consistent padding (24px desktop, 16px mobile)
Rounded corners (8px)
Subtle border (#224430)
Optional header with serif font for title
Content area with sans-serif text
Action area at bottom with right-aligned buttons
Buttons
Primary: Filled #92e8b8 background, dark text
Secondary: Outlined with #21835d border, light text
Tertiary: Text only with hover effect
All buttons have:
8px border radius
Sans serif font
Consistent padding (12px 20px)
Clear hover and active states
Navigation
Main Nav:
Sans serif font for readability
Current page indicator
Hover effects with subtle transitions
Secondary Nav:
Smaller text size
Lighter color weight
Clear grouping of related items
Form Elements
Consistent styling with clear labels (top-aligned)
Generous input heights for touch targets (48px)
Visible focus states
Inline validation feedback
Grouped related fields with fieldset-like containers