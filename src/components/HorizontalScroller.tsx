
import React, { useRef, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DetailButton from './DetailButton';

interface Section {
  id: number;
  topVideoSrc: string;
  bottomVideoSrc: string;
  buttonTitle: string;
  buttonDescription: string;
  buttonContent: string;
}

interface HorizontalScrollerProps {
  sections: Section[];
  onFinalSection: () => void;
  showFinalVideo?: boolean;
}

const HorizontalScroller: React.FC<HorizontalScrollerProps> = ({ 
  sections, 
  onFinalSection,
  showFinalVideo = false
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
      
      if (currentSection === sections.length - 2) {
        setTimeout(() => {
          onFinalSection();
          toast({
            title: "Final section reached",
            description: "Experience the full immersion!",
          });
        }, 500);
      }
    }
  };

  const handlePrev = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSection]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scroll({
        left: currentSection * window.innerWidth,
        behavior: 'smooth'
      });
    }
  }, [currentSection]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-screen overflow-hidden flex snap-x snap-mandatory"
      style={{ scrollSnapType: 'x mandatory' }}
    >
      {sections.map((section, index) => (
        <div 
          key={section.id}
          className="min-w-full h-full flex-shrink-0 relative snap-center"
          id={`section-${index}`}
        >
          <div className="relative h-full w-full">
            {/* Top video */}
            <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden">
              <video 
                src={section.topVideoSrc} 
                className="w-full h-full object-cover"
                autoPlay 
                loop 
                muted 
                playsInline
              />
            </div>
            
            {/* Bottom video */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden">
              <video 
                src={section.bottomVideoSrc} 
                className="w-full h-full object-cover"
                autoPlay 
                loop 
                muted 
                playsInline
              />
            </div>
            
            {/* Center button */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
              <DetailButton 
                title={section.buttonTitle}
                description={section.buttonDescription}
                content={section.buttonContent}
              />
            </div>
          </div>
        </div>
      ))}
      
      {/* Navigation controls - Always visible unless at first section */}
      <button 
        onClick={handlePrev}
        disabled={currentSection === 0}
        className={`fixed left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white
          ${currentSection === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100'}`}
        aria-label="Previous section"
      >
        <ChevronLeft size={24} />
      </button>
      
      <button 
        onClick={handleNext}
        disabled={currentSection === sections.length - 1}
        className={`fixed right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white
          ${currentSection === sections.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100'}`}
        aria-label="Next section"
      >
        <ChevronRight size={24} />
      </button>
      
      {/* Section indicators - Always clickable for navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex space-x-2">
        {sections.map((_, i) => (
          <button 
            key={i} 
            className={`w-3 h-3 rounded-full ${currentSection === i ? 'bg-white' : 'bg-white/30'}`}
            onClick={() => setCurrentSection(i)}
            aria-label={`Go to section ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HorizontalScroller;