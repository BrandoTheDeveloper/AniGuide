export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-40">
      <div className="flex items-center justify-around py-2">
        <a href="/" className="flex flex-col items-center py-2 text-primary">
          <i className="fas fa-home text-xl mb-1"></i>
          <span className="text-xs font-medium">Discover</span>
        </a>
        <a href="/" className="flex flex-col items-center py-2 text-muted-foreground">
          <i className="fas fa-search text-xl mb-1"></i>
          <span className="text-xs font-medium">Search</span>
        </a>
        <a href="#" className="flex flex-col items-center py-2 text-muted-foreground">
          <i className="fas fa-bookmark text-xl mb-1"></i>
          <span className="text-xs font-medium">My List</span>
        </a>
        <a href="#" className="flex flex-col items-center py-2 text-muted-foreground">
          <i className="fas fa-star text-xl mb-1"></i>
          <span className="text-xs font-medium">Reviews</span>
        </a>
      </div>
    </nav>
  );
}
