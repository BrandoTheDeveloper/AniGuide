import { Link, useLocation } from "wouter";
import { Home, Search, Bookmark, Star, User } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Discover" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/favorites", icon: Bookmark, label: "My List" },
    { path: "/reviews", icon: Star, label: "Reviews" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-40"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            href={path}
            className={`flex flex-col items-center py-2 transition-colors ${
              location === path ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
            aria-label={`Navigate to ${label}`}
            role="link"
          >
            <Icon className="w-5 h-5 mb-1" aria-hidden="true" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
