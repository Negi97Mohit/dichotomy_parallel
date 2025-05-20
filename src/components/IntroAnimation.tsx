
import React, { useEffect, useState } from 'react';

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [showText, setShowText] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show text after a short delay
    const showTextTimeout = setTimeout(() => {
      setShowText(true);
    }, 500);

    // Start fade out animation
    const fadeOutTimeout = setTimeout(() => {
      setFadeOut(true);
    }, 3000);

    // Complete animation
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => {
      clearTimeout(showTextTimeout);
      clearTimeout(fadeOutTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div 
        className={`text-6xl md:text-8xl font-bold text-white transition-opacity duration-1500
          ${showText ? 'opacity-100' : 'opacity-0'} 
          ${fadeOut ? 'animate-fade-out' : ''}
        `}
      >
        <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 bg-clip-text text-transparent">
          Hello, Welcome To Creator Enji's Portfolio
        </span>
      </div>
    </div>
  );
};

export default IntroAnimation;
