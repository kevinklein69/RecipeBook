import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  safelist: [
    "bg-green-500", "border-green-500", "bg-green-100", "text-green-700",
    "bg-emerald-500", "border-emerald-500", "bg-emerald-100", "text-emerald-700",
    "bg-red-500", "border-red-500", "bg-red-100", "text-red-700",
    "bg-blue-500", "border-blue-500", "bg-blue-100", "text-blue-700",
    "bg-amber-500", "border-amber-500", "bg-amber-100", "text-amber-700",
  ],
  plugins: [],
};

export default config;
