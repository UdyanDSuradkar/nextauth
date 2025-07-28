/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // Required for App Router
    "./components/**/*.{js,ts,jsx,tsx}", // Optional if you use components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
