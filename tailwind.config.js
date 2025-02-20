export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(210, 20%, 10%)', // لون الخلفية
        foreground: 'hsl(0, 0%, 100%)', // لون النص
        primary: {
          DEFAULT: 'hsl(210, 80%, 60%)', // اللون الأساسي
          foreground: 'hsl(0, 0%, 100%)', // لون النص على الخلفية الأساسية
        },
        card: {
          DEFAULT: 'hsl(210, 20%, 15%)', // لون الخلفية للبطاقات
          foreground: 'hsl(0, 0%, 100%)', // لون النص على البطاقات
        },
        border: 'hsl(210, 20%, 25%)', // لون الحدود
        input: 'hsl(210, 20%, 25%)', // لون خلفية الحقول
      },
      borderRadius: {
        lg: '0.5rem', // زوايا دائرية
      },
    },
  },
  plugins: [],
}