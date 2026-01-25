import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
  variant?: 'default' | 'minimal' | 'dashboard';
  showSearch?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

export const Logo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Link to="/" className={`flex items-center gap-2 group ${className}`}>
    <div className="relative">
      <div className="size-9 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
        <Sparkles className="size-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-transparent rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <span className="text-xl font-bold tracking-tight text-foreground">Ejo Innovation</span>
  </Link>
);

export const Header: React.FC<HeaderProps> = ({
  variant = 'default',
  showSearch = false,
  searchValue = '',
  searchPlaceholder = 'Search articles, authors, or DOIs...',
  children,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur border-b border-border">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />
          
          {showSearch && variant === 'default' && (
            <div className="hidden md:flex items-center gap-8 flex-1 justify-center px-8">
              <div className="w-full max-w-md">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-muted-foreground group-focus-within:text-primary transition-colors">search</span>
                  </div>
                  <input 
                    className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg leading-5 bg-secondary text-sm placeholder-muted-foreground focus:outline-none focus:placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all duration-200" 
                    placeholder={searchPlaceholder} 
                    type="text"
                    defaultValue={searchValue}
                  />
                </div>
              </div>
            </div>
          )}
          
          {children}
        </div>
      </div>
    </header>
  );
};

export default Header;
