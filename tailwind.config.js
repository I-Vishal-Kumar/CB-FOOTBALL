/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/flowbite-react/lib/**/*.js",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Chelsea crest palette: blue-* utilities shifted to the club's royal blue
      colors: {
        blue: {
          400: "#4A7FE3",
          500: "#1A5FD6",
          600: "#0B52BD",
          700: "#034694",
          800: "#033A7A",
        },
        chelsea: {
          blue: "#034694",
          royal: "#1A5FD6",
          gold: "#DBA111",
        },
      },
      fontWeight: {
        bold: 600,
        medium: 400,
      },
      fontSize: {
        sm: "0.7rem",
        xs: "0.58rem",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("flowbite/plugin")],
  plugins: [require("tw-elements/dist/plugin.cjs")],
};
