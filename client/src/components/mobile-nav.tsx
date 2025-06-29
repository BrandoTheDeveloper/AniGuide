export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 md:hidden z-40">
      <div className="flex items-center justify-around py-2">
        <a href="/" className="flex flex-col items-center py-2 text-accent">
          <i className="fas fa-home text-xl mb-1"></i>
          <span className="text-xs font-medium">Discover</span>
        </a>
        <a href="/" className="flex flex-col items-center py-2 text-slate-400">
          <i className="fas fa-search text-xl mb-1"></i>
          <span className="text-xs font-medium">Search</span>
        </a>
        <a href="#" className="flex flex-col items-center py-2 text-slate-400">
          <i className="fas fa-bookmark text-xl mb-1"></i>
          <span className="text-xs font-medium">My List</span>
        </a>
        <a href="#" className="flex flex-col items-center py-2 text-slate-400">
          <i className="fas fa-star text-xl mb-1"></i>
          <span className="text-xs font-medium">Reviews</span>
        </a>
      </div>
    </nav>
  );
}
