import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import React, { useEffect } from "react";
import Home from "@/pages/home";
import AnimeDetail from "@/pages/anime-detail";
import Profile from "@/pages/profile";
import Search from "@/pages/search";
import Reviews from "@/pages/reviews";
import Favorites from "@/pages/favorites";
import PrivacyPolicy from "./pages/privacy-policy";
import NotFound from "@/pages/not-found";

// SEO component for meta tags
function SEOHead({ title, description, path }: { title: string; description: string; path: string }) {
  useEffect(() => {
    document.title = title;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', description);
  }, [title, description, path]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <SEOHead 
          title="AniGuide - Discover & Review Anime" 
          description="Explore trending anime, read reviews, and track your watchlist. Discover your next favorite anime series with AniGuide's comprehensive database and community reviews."
          path="/"
        />
        <Home />
      </Route>
      <Route path="/search">
        <SEOHead 
          title="Search Anime - AniGuide" 
          description="Search through thousands of anime titles. Find anime by genre, year, rating, and more. Discover hidden gems and popular series."
          path="/search"
        />
        <Search />
      </Route>
      <Route path="/favorites">
        <SEOHead 
          title="My Watchlist - AniGuide" 
          description="Manage your personal anime watchlist. Track what you're watching, plan to watch, and completed series. Rate and organize your anime collection."
          path="/favorites"
        />
        <Favorites />
      </Route>
      <Route path="/reviews">
        <SEOHead 
          title="Anime Reviews - AniGuide" 
          description="Read and write anime reviews. Share your thoughts on your favorite series and discover what the community thinks about different anime."
          path="/reviews"
        />
        <Reviews />
      </Route>
      <Route path="/profile">
        <SEOHead 
          title="My Profile - AniGuide" 
          description="Manage your AniGuide profile settings, preferences, and account information. Customize your anime discovery experience."
          path="/profile"
        />
        <Profile />
      </Route>
      <Route path="/anime/:id">
        <SEOHead 
          title="Anime Details - AniGuide" 
          description="Get detailed information about anime series including episodes, ratings, reviews, and related shows. Join the discussion with the anime community."
          path="/anime"
        />
        <AnimeDetail />
      </Route>
      <Route path="/favorites">
        <Favorites />
      </Route>
      <Route path="/privacy-policy">
        <PrivacyPolicy />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;