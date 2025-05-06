import Plotly from 'plotly.js-dist-min';

/**
 * Common theme-based colors for all visualizations
 */
export const getChartColors = (isDark: boolean) => ({
  textColor: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
  backgroundColor: isDark ? '#27272a' : '#f9fafb', // zinc-800 for dark, gray-50 for light
  gridColor: isDark ? 'rgba(82, 82, 91, 0.3)' : 'rgba(212, 212, 216, 0.5)', // zinc-600/zinc-300 with opacity
  legendBackground: isDark ? 'rgba(39, 39, 42, 0.8)' : 'rgba(250, 250, 250, 0.8)', // zinc-800/zinc-50 with opacity
  
  // Specific to histogram
  histogramColor: isDark ? 'rgba(161, 161, 170, 0.7)' : 'rgba(113, 113, 122, 0.7)', // zinc-400/zinc-500 with opacity
  kdeColor: isDark ? 'rgba(244, 244, 245, 0.9)' : 'rgba(63, 63, 70, 0.9)', // zinc-100/zinc-700 with opacity
  
  // For box and violin plots
  boxplotColor: isDark ? 'rgba(161, 161, 170, 0.8)' : 'rgba(113, 113, 122, 0.8)',
  violinColor: isDark ? 'rgba(212, 212, 216, 0.7)' : 'rgba(82, 82, 91, 0.7)',
  
  // For categorical plots
  categoricalColors: [
    isDark ? 'rgba(212, 212, 216, 0.8)' : 'rgba(63, 63, 70, 0.8)',
    isDark ? 'rgba(161, 161, 170, 0.8)' : 'rgba(113, 113, 122, 0.8)',
    isDark ? 'rgba(113, 113, 122, 0.8)' : 'rgba(161, 161, 170, 0.8)',
    isDark ? 'rgba(82, 82, 91, 0.8)' : 'rgba(212, 212, 216, 0.8)',
  ],

  barGradient: isDark 
    ? [
        // Zinc palette (lighter)
        'rgba(250, 250, 250, 0.90)', // zinc-50
        'rgba(244, 244, 245, 0.87)', // zinc-100
        'rgba(228, 228, 231, 0.84)', // zinc-200
        'rgba(212, 212, 216, 0.81)', // zinc-300
        'rgba(161, 161, 170, 0.78)', // zinc-400
        
        // Stone palette (mid tones)
        'rgba(245, 245, 244, 0.75)', // stone-100
        'rgba(231, 229, 228, 0.72)', // stone-200
        'rgba(214, 211, 209, 0.69)', // stone-300
        'rgba(168, 162, 158, 0.66)', // stone-400
        'rgba(120, 113, 108, 0.63)', // stone-500
        
        // Gray palette (darker)
        'rgba(243, 244, 246, 0.60)', // gray-100
        'rgba(229, 231, 235, 0.57)', // gray-200
        'rgba(209, 213, 219, 0.54)', // gray-300
        'rgba(156, 163, 175, 0.51)', // gray-400
        'rgba(107, 114, 128, 0.48)', // gray-500
      ]
    : [
        // Zinc palette (darker)
        'rgba(24, 24, 27, 0.90)',    // zinc-900
        'rgba(39, 39, 42, 0.87)',    // zinc-800
        'rgba(63, 63, 70, 0.84)',    // zinc-700
        'rgba(82, 82, 91, 0.81)',    // zinc-600
        'rgba(113, 113, 122, 0.78)', // zinc-500
        
        // Stone palette (mid tones)
        'rgba(41, 37, 36, 0.75)',    // stone-800
        'rgba(68, 64, 60, 0.72)',    // stone-700
        'rgba(87, 83, 78, 0.69)',    // stone-600
        'rgba(120, 113, 108, 0.66)', // stone-500
        'rgba(168, 162, 158, 0.63)', // stone-400
        
        // Gray palette (lighter)
        'rgba(31, 41, 55, 0.60)',    // gray-800
        'rgba(55, 65, 81, 0.57)',    // gray-700
        'rgba(75, 85, 99, 0.54)',    // gray-600
        'rgba(107, 114, 128, 0.51)', // gray-500
        'rgba(156, 163, 175, 0.48)', // gray-400
      ]
});

// Add this near the top of your component or in a constants file
/* const CUSTOM_DOWNLOAD_ICON: Record<string, string|number> = {
    width: 24,
    height: 24,
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-11h2v4h3l-4 4-4-4h3z', // Example SVG path for a download icon
    transform: 'matrix(1 0 0 1 0 0)'
}; */

/**
 * Standard Plotly configuration for all charts
 */
export const getPlotlyConfig = (filename: string): Partial<Plotly.Config> => ({
  responsive: true,
  displayModeBar: true,
  modeBarButtonsToRemove: [
    'zoom2d', 
    'pan2d', 
    'select2d',
    'lasso2d',
    'zoomIn2d',
    'zoomOut2d',
    'autoScale2d',
    'resetScale2d',
    'autoScale2d',
    'toggleSpikelines',
    'hoverClosestCartesian',
    'hoverCompareCartesian'
  ],
  displaylogo: false,
  toImageButtonOptions: {
    format: 'png',
    filename: filename,
    height: 500,
    width: 700,
    scale: 2
  },
  /* modeBarButtons: [[{
    name: 'Download Plot',
    icon: CUSTOM_DOWNLOAD_ICON,
    click: function(gd: any) {
      Plotly.downloadImage(gd, {
        format: 'png',
        filename: `histogram_${columnName}`,
        height: 500,
        width: 700,
        scale: 2
      });
    }
  }]], */
});

/**
 * Common layout settings for all charts
 */
export const getBaseLayout = (
  isDark: boolean, 
  containerWidth: number,
  xAxisTitle: string = '',
  yAxisTitle: string = ''
): Partial<Plotly.Layout> => {
  const colors = getChartColors(isDark);
  
  return {
    font: {
      family: 'monospace',
      color: colors.textColor
    },
    xaxis: {
      title: {
        text: xAxisTitle,
        font: {
          family: 'monospace',
          size: 12
        }
      },
      tickfont: {
        family: 'monospace',
        size: 10
      },
      gridcolor: colors.gridColor
    },
    yaxis: {
      title: {
        text: yAxisTitle,
        font: {
          family: 'monospace',
          size: 12
        }
      },
      tickfont: {
        family: 'monospace',
        size: 10
      },
      gridcolor: colors.gridColor
    },
    paper_bgcolor: colors.backgroundColor,
    plot_bgcolor: colors.backgroundColor,
    margin: {
      l: 50,
      r: 10,
      t: 40,
      b: 50
    },
    height: 400,
    width: containerWidth,
    autosize: false,
    showlegend: true,
    legend: {
      x: 0.95,
      y: 0.95,
      font: {
        family: 'monospace',
        size: 10
      },
      bgcolor: colors.legendBackground
    }
  };
};