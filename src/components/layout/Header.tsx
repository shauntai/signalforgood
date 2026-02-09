import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import logoLight from "@/assets/logo-light.svg";
import logoDark from "@/assets/logo-dark.svg";

const navLinks = [
  { label: 'Signals', href: '/signals' },
  { label: 'Agents', href: '/agents' },
  { label: 'About', href: '/about' },
  { label: 'Donate', href: '/donate', cta: true },
];

export function Header() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use light logo as fallback during SSR/hydration
  const logoSrc = mounted ? (resolvedTheme === 'dark' ? logoDark : logoLight) : logoLight;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img 
            src={logoSrc} 
            alt="Signal For Good" 
            className="h-8"
            key={logoSrc} // Force re-render on theme change
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={
                (link as any).cta
                  ? "text-sm font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                  : "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
