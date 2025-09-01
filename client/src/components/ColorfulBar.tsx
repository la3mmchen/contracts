import React, { useState, useEffect } from 'react';

export const ColorfulBar: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<string>('light');
  
  useEffect(() => {
    // Check localStorage directly for the most reliable theme detection
    const checkTheme = () => {
      const storedTheme = localStorage.getItem('theme') || 'system';
      let actualTheme = storedTheme;
      
      // If system theme, resolve it
      if (storedTheme === 'system') {
        actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      setCurrentTheme(actualTheme);
    };
    
    checkTheme();
    
    // Listen for theme changes
    const handleStorageChange = () => checkTheme();
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically to catch theme changes
    const interval = setInterval(checkTheme, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  
  // For black-and-white theme, show a simple black bar
  if (currentTheme === 'black-and-white') {
    return (
      <div className="fixed top-0 left-0 w-full h-4 bg-black z-50">
        {/* Simple black bar for black-white theme */}
      </div>
    );
  }
  
  // For all other themes (light, dark, sepia, system), show the colorful bar
  return (
    <div className="fixed top-0 left-0 w-full h-4 bg-gradient-to-r from-[#01A5E1] via-[#0DD1EE] via-[#F5DA6C] via-[#285CC4] via-[#A7E459] to-[#E45093] z-50">
      {/* Individual color segments for precise control */}
      <div className="flex h-full">
        <div className="flex-1 bg-[#01A5E1]"></div>
        <div className="flex-1 bg-[#0DD1EE]"></div>
        <div className="flex-1 bg-[#F5DA6C]"></div>
        <div className="flex-1 bg-[#285CC4]"></div>
        <div className="flex-1 bg-[#A7E459]"></div>
        <div className="flex-1 bg-[#E45093]"></div>
      </div>
    </div>
  );
};
