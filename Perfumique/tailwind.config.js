/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: "class",
    theme: {
      extend: {
        colors:{
          primary: "#fea928",
          secondary: "#ed8900"
        },
        container: {
          center: true,
          padding: {
            DEFAULT: "1rem",
            sm: "3rem",
          }
        }
      },
    },
    plugins: [],
  }
  