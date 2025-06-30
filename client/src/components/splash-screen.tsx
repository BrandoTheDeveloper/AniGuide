import { useEffect, useState } from "react";
import aniguideLogo512 from "@assets/aniguide-logo-512x512_1751223690505.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Wait for fade out animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-[#DAD2D8] flex items-center justify-center z-50 opacity-0 transition-opacity duration-300 pointer-events-none">
        <div className="text-center">
          <img 
            src={aniguideLogo512} 
            alt="AniGuide"
            className="w-32 h-32 mx-auto mb-6 animate-pulse"
          />
          <h1 className="text-4xl font-bold text-[#06070E] mb-2">AniGuide</h1>
          <p className="text-[#2F2D2E] text-lg">Discover Amazing Anime</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#DAD2D8] flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="text-center">
        <img 
          src={aniguideLogo512} 
          alt="AniGuide"
          className="w-32 h-32 mx-auto mb-6 animate-pulse"
        />
        <h1 className="text-4xl font-bold text-[#06070E] mb-2">AniGuide</h1>
        <p className="text-[#2F2D2E] text-lg">Discover Amazing Anime</p>
      </div>
    </div>
  );
}