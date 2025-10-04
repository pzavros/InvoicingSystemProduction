// Color Themes that can be applied to any layout
export const COLOR_THEMES = {
  blue: {
    id: 'blue',
    name: 'Professional Blue',
    description: 'Trust and reliability - perfect for corporate clients',
    colors: {
      primary: '#2563eb',      // Main blue
      secondary: '#1e40af',    // Darker blue
      accent: '#3b82f6',       // Light blue
      background: '#f8fafc',   // Light gray-blue
      surface: '#ffffff',      // White
      text: '#1f2937',         // Dark gray
      textSecondary: '#6b7280', // Medium gray
      success: '#10b981',      // Green
      warning: '#f59e0b',      // Orange
      error: '#ef4444'         // Red
    },
    gradients: {
      header: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
      accent: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      subtle: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }
  },

  green: {
    id: 'green',
    name: 'Growth Green',
    description: 'Fresh and modern - great for creative and eco-friendly businesses',
    colors: {
      primary: '#059669',      // Main green
      secondary: '#047857',    // Darker green
      accent: '#10b981',       // Light green
      background: '#f0fdf4',   // Light green-tinted
      surface: '#ffffff',      // White
      text: '#1f2937',         // Dark gray
      textSecondary: '#6b7280', // Medium gray
      success: '#10b981',      // Green
      warning: '#f59e0b',      // Orange
      error: '#ef4444'         // Red
    },
    gradients: {
      header: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      accent: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      subtle: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
    }
  },

  purple: {
    id: 'purple',
    name: 'Creative Purple',
    description: 'Innovative and creative - perfect for design agencies and startups',
    colors: {
      primary: '#7c3aed',      // Main purple
      secondary: '#6d28d9',    // Darker purple
      accent: '#8b5cf6',       // Light purple
      background: '#faf5ff',   // Light purple-tinted
      surface: '#ffffff',      // White
      text: '#1f2937',         // Dark gray
      textSecondary: '#6b7280', // Medium gray
      success: '#10b981',      // Green
      warning: '#f59e0b',      // Orange
      error: '#ef4444'         // Red
    },
    gradients: {
      header: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
      accent: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      subtle: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)'
    }
  },

  orange: {
    id: 'orange',
    name: 'Energy Orange',
    description: 'Vibrant and energetic - great for marketing and creative services',
    colors: {
      primary: '#ea580c',      // Main orange
      secondary: '#c2410c',    // Darker orange
      accent: '#fb923c',       // Light orange
      background: '#fff7ed',   // Light orange-tinted
      surface: '#ffffff',      // White
      text: '#1f2937',         // Dark gray
      textSecondary: '#6b7280', // Medium gray
      success: '#10b981',      // Green
      warning: '#f59e0b',      // Orange
      error: '#ef4444'         // Red
    },
    gradients: {
      header: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
      accent: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
      subtle: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)'
    }
  },

  red: {
    id: 'red',
    name: 'Bold Red',
    description: 'Strong and confident - perfect for consulting and professional services',
    colors: {
      primary: '#dc2626',      // Main red
      secondary: '#b91c1c',    // Darker red
      accent: '#ef4444',       // Light red
      background: '#fef2f2',   // Light red-tinted
      surface: '#ffffff',      // White
      text: '#1f2937',         // Dark gray
      textSecondary: '#6b7280', // Medium gray
      success: '#10b981',      // Green
      warning: '#f59e0b',      // Orange
      error: '#ef4444'         // Red
    },
    gradients: {
      header: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      accent: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      subtle: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)'
    }
  },

  teal: {
    id: 'teal',
    name: 'Modern Teal',
    description: 'Calm and professional - excellent for healthcare and technology',
    colors: {
      primary: '#0d9488',      // Main teal
      secondary: '#0f766e',    // Darker teal
      accent: '#14b8a6',       // Light teal
      background: '#f0fdfa',   // Light teal-tinted
      surface: '#ffffff',      // White
      text: '#1f2937',         // Dark gray
      textSecondary: '#6b7280', // Medium gray
      success: '#10b981',      // Green
      warning: '#f59e0b',      // Orange
      error: '#ef4444'         // Red
    },
    gradients: {
      header: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
      accent: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
      subtle: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)'
    }
  },

  gray: {
    id: 'gray',
    name: 'Classic Gray',
    description: 'Timeless and elegant - perfect for law firms and formal businesses',
    colors: {
      primary: '#374151',      // Main gray
      secondary: '#1f2937',    // Darker gray
      accent: '#6b7280',       // Medium gray
      background: '#f9fafb',   // Light gray
      surface: '#ffffff',      // White
      text: '#1f2937',         // Dark gray
      textSecondary: '#6b7280', // Medium gray
      success: '#10b981',      // Green
      warning: '#f59e0b',      // Orange
      error: '#ef4444'         // Red
    },
    gradients: {
      header: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
      accent: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
      subtle: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
    }
  },

  indigo: {
    id: 'indigo',
    name: 'Deep Indigo',
    description: 'Sophisticated and trustworthy - ideal for finance and consulting',
    colors: {
      primary: '#4338ca',      // Main indigo
      secondary: '#3730a3',    // Darker indigo
      accent: '#6366f1',       // Light indigo
      background: '#faf5ff',   // Light indigo-tinted
      surface: '#ffffff',      // White
      text: '#1f2937',         // Dark gray
      textSecondary: '#6b7280', // Medium gray
      success: '#10b981',      // Green
      warning: '#f59e0b',      // Orange
      error: '#ef4444'         // Red
    },
    gradients: {
      header: 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)',
      accent: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
      subtle: 'linear-gradient(135deg, #faf5ff 0%, #e0e7ff 100%)'
    }
  }
};

export default COLOR_THEMES;
