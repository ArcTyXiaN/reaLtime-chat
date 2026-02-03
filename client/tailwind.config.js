/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Simple Light Mode Colors
        'bg-main': '#FFFFFF',
        'bg-secondary': '#F5F5F5',
        'bg-tertiary': '#E8E8E8',
        'chat-sender': '#007AFF',      // Blue
        'chat-receiver': '#E5E5EA',     // Light Gray
        'accent': '#007AFF',            // Blue
        'success': '#34C759',           // Green
        'warning': '#FF9500',           // Orange
        'error': '#FF3B30',             // Red
        'text-primary': '#000000',
        'text-secondary': '#666666',
        'text-muted': '#999999',
        'border': '#D1D1D6',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}