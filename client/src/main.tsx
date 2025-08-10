import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize theme to prevent flash of unstyled content
const initializeTheme = () => {
  const theme = localStorage.getItem('theme') || 'system';
  const root = document.documentElement;
  
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark');
  } else {
    root.classList.add('light');
  }
};

// Initialize theme before rendering
initializeTheme();

createRoot(document.getElementById("root")!).render(<App />);
