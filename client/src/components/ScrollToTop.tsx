import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  // For black-and-white theme, use black background
  const buttonClasses = resolvedTheme === 'black-and-white' 
    ? "fixed bottom-6 right-6 z-50 rounded-full w-12 h-12 p-0 shadow-lg bg-black hover:bg-gray-800 text-white border-0"
    : "fixed bottom-6 right-6 z-50 rounded-full w-12 h-12 p-0 shadow-lg bg-[#01A5E1] hover:bg-[#01A5E1]/90 text-white border-0";

  return (
    <Button
      onClick={scrollToTop}
      className={buttonClasses}
      title="Scroll to top"
    >
      <ChevronUp className="h-6 w-6" />
    </Button>
  );
};
