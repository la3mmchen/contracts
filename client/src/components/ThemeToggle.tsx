import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Moon, Sun, Monitor, Check, Palette, Contrast } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-4 w-4" />;
    }
    if (theme === 'dark') {
      return <Moon className="h-4 w-4" />;
    }
    if (theme === 'sepia') {
      return <Palette className="h-4 w-4" />;
    }
    if (theme === 'black-and-white') {
      return <Contrast className="h-4 w-4" />;
    }
    return <Sun className="h-4 w-4" />;
  };

  const getLabel = () => {
    if (theme === 'system') {
      return `System (${resolvedTheme === 'dark' ? 'Dark' : resolvedTheme === 'sepia' ? 'Sepia' : resolvedTheme === 'black-and-white' ? 'B&W' : 'Light'})`;
    }
    if (theme === 'dark') return 'Dark';
    if (theme === 'sepia') return 'Sepia';
    if (theme === 'black-and-white') return 'B&W';
    return 'Light';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 w-9 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30 hover:border-white/50 shadow-sm"
              >
                {getIcon()}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
                {theme === 'light' && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
                {theme === 'dark' && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('sepia')}>
                <Palette className="mr-2 h-4 w-4" />
                <span>Sepia</span>
                {theme === 'sepia' && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('black-and-white')}>
                <Contrast className="mr-2 h-4 w-4" />
                <span>Black & White</span>
                {theme === 'black-and-white' && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-4 w-4" />
                <span>System</span>
                {theme === 'system' && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Theme: {getLabel()}</p>
          <p className="text-xs text-muted-foreground">Ctrl+Shift+T to toggle</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Simple toggle button variant for mobile
export function ThemeToggleSimple() {
  const { resolvedTheme, toggle } = useTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={toggle}
            className="h-9 w-9 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30 hover:border-white/50 shadow-sm"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch to {resolvedTheme === 'light' ? 'dark' : 'light'} mode</p>
          <p className="text-xs text-muted-foreground">Ctrl+Shift+T to toggle</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
