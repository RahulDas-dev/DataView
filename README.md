# Dataview App

A modern, responsive data exploration and analysis tool built with React, TypeScript, and Tailwind CSS. The application lets users load, visualize, analyze, and manipulate tabular data with an intuitive interface.

## 🌟 Features

- **Data Loading:** Import data from local CSV files or URLs
- **Interactive Data Table:** View, sort, and navigate through data with pagination
- **Data Summary:** Get quick insights with statistical summaries
- **Univariate Statistics:** Analyze individual columns with detailed statistics
- **Column Renaming & Type Conversion:** Modify column names and data types
- **Visualization:** Generate interactive charts for data exploration
- **Dark/Light Theme:** Seamless theme switching for comfortable viewing
- **Responsive Design:** Works on desktop and mobile devices
- **Export Functionality:** Save modified data as CSV files

## 🧩 Application Structure

### Core Components

#### `App.tsx`
The root component that sets up the app structure and ErrorBoundary.

#### `Appbody.tsx`
The main container component that conditionally renders data visualization components when data is loaded.

#### Data Components
- **`DataLoader.tsx`**: Manages file/URL uploads with toggle between browse mode and URL mode
- **`DataTable.tsx`**: Displays tabular data with pagination and export functionality
- **`DataSummary.tsx`**: Shows dataset statistics including row/column counts, null values, data types
- **`UnivariateStats.tsx`**: Provides detailed statistics for individual columns
- **`ChartModal.tsx`**: Visualizes column data with appropriate chart types

#### UI Components
- **`TitleBar.tsx`**: App header with theme toggle and navigation
- **`Button.tsx`**: Reusable button component with various styles
- **`FileBrowser.tsx`**: Component for selecting and processing CSV files
- **`FetchUrl.tsx`**: Component for entering and processing data URLs
- **`RenameColumnDialog.tsx`**: Modal for renaming columns and changing data types
- **`SettingsDialog.tsx`**: Modal for configuring app settings
- **`RadioCheckbox.tsx`**: Custom toggle component for selecting input methods
- **`ErrorBoundary.tsx`**: React error boundary for graceful error handling

### Context Management

The app uses React Context for global state management:

- **`DataContext.tsx`**: Manages the DataFrame state across components
- **`SettingsContext.tsx`**: Handles app configuration like rows per page, column width
- **`ThemeContext.tsx`**: Controls light/dark theme switching

### Utility Functions

Located in the `utility/` directory:
- **`FileUtility.ts`**: Functions for file validation and CSV parsing
- **`DfUtility.ts`**: DataFrame utility functions for type conversion, duplicates detection
- **`dataLoaderReducer.ts`**: Reducer for managing the data loading state machine

### Custom Hooks

Located in the `hooks/` directory:
- **`useData.tsx`**: Access the DataFrame context
- **`useSettings.tsx`**: Access and update app settings
- **`useTheme.tsx`**: Control the app's theme
- **`useColumnStats.tsx`**: Calculate statistics for individual columns
- **`useDataStats.tsx`**: Calculate dataset-wide statistics

## 💅 Styling and Theming

### Tailwind CSS

The app uses Tailwind CSS for styling with a consistent design system:

- **Color Palette**: Based on zinc color scale for a clean, professional look
- **Typography**: Uses Montserrat for headings and monospace fonts for data display
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Custom Components**: Styled buttons, tables, and form elements

### Dark/Light Theme

The app features a comprehensive dark/light theme implementation:
- Theme preference is saved in localStorage
- Auto-detects system preference when no saved preference exists
- Smooth transitions between themes
- Dark theme optimized for reduced eye strain with careful color selection

### Custom UI Elements

- **Custom Scrollbars**: Enhanced scrollbar styling for better usability
- **Data Tables**: Fixed header tables with optimized column widths
- **Form Controls**: Consistent styling across inputs, buttons, and selectors
- **Modal Dialogs**: Clean, focused dialog boxes for settings and operations
- **Tooltips**: Contextual information display for better user experience

## 🛠️ Technical Implementation

- **React**: Functional components with hooks for state management
- **TypeScript**: Strong typing throughout the application
- **Danfojs**: JavaScript data analysis library (similar to pandas)
- **Plotly.js**: Interactive data visualization
- **Vite**: Fast, modern build tool and development server
- **Error Handling**: Comprehensive error boundaries and user-friendly messages
- **Performance Optimization**: Memoization of calculations and renders

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies with `npm install` or `pnpm install`
3. Run the development server with `npm run dev` or `pnpm dev`
4. Build for production with `npm run build` or `pnpm build`

## 🧪 Example Usage

1. Load a CSV file using the file browser or URL input
2. Explore the data table with pagination controls
3. View dataset summary statistics
4. Select columns in the Univariate Statistics panel to analyze
5. Generate visualizations using the Chart button
6. Rename columns or change data types as needed
7. Export modified data to CSV for further use




