import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
// DetailButton is not directly used in this version as the discover buttons are now standard Buttons
// import DetailButton from './DetailButton';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionData } from '@/pages/Index'; // Import the interface
import ReactMarkdown from 'react-markdown';

interface HorizontalScrollerProps {
  sections: SectionData[];
  initialSectionIndex?: number;
  onSectionChange?: (index: number) => void;
  playbackRate?: number;
}

const HorizontalScroller: React.FC<HorizontalScrollerProps> = ({
  sections,
  initialSectionIndex = 0,
  onSectionChange,
  playbackRate = 1.0,
}) => {
  const [currentSection, setCurrentSectionState] = useState(initialSectionIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDetailCardOpen, setIsDetailCardOpen] = useState(false);
  const [openedCardData, setOpenedCardData] = useState<{
    title: string;
    description: string;
    content: string;
    videoSrc?: string; // Video for the card content
  } | null>(null);

  const topVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const bottomVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Effect to initialize video refs arrays based on the number of sections
  useEffect(() => {
    topVideoRefs.current = Array(sections.length).fill(null);
    bottomVideoRefs.current = Array(sections.length).fill(null);
  }, [sections.length]);

  // Function to apply playback speed to the currently visible videos
  const applyPlaybackSpeedToCurrentVideos = (speed: number) => {
    const topVideo = topVideoRefs.current[currentSection];
    const bottomVideo = bottomVideoRefs.current[currentSection];

    if (topVideo && topVideo.playbackRate !== speed) {
      topVideo.playbackRate = speed;
    }
    // Only apply to bottom video if it's not the final experience
    if (bottomVideo && !sections[currentSection]?.isFinalExperience && bottomVideo.playbackRate !== speed) {
      bottomVideo.playbackRate = speed;
    }
  };

  // Effect to synchronize current section with initialSectionIndex prop from parent
  useEffect(() => {
    setCurrentSectionState(initialSectionIndex);
    // If the section is changed externally (e.g., by "Restart" button), close any open card
    if (initialSectionIndex !== currentSection) {
        setIsDetailCardOpen(false);
        setOpenedCardData(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSectionIndex]); // currentSection is intentionally omitted from deps to prevent potential loops if onSectionChange directly updates initialSectionIndex

  // Effect to apply playback speed when the current section or the global playbackRate prop changes
  useEffect(() => {
    applyPlaybackSpeedToCurrentVideos(playbackRate);
  }, [currentSection, playbackRate, sections]); // sections dependency ensures refs are up-to-date if sections change

  // Function to update the current section state and notify the parent component
  const updateCurrentSection = (newSection: number) => {
    if (newSection >= 0 && newSection < sections.length) {
      setCurrentSectionState(newSection);
      if (onSectionChange) {
        onSectionChange(newSection);
      }
      // Always close the detail card when navigating to a new section
      setIsDetailCardOpen(false);
      setOpenedCardData(null);
    }
  };

  // Handlers for next and previous section navigation via arrow buttons
  const handleNext = () => {
    if (currentSection < sections.length - 1) {
        updateCurrentSection(currentSection + 1);
    }
  };

  const handlePrev = () => {
     if (currentSection > 0) {
        updateCurrentSection(currentSection - 1);
    }
  };
  
  // Function to prepare and open the detail card with data from the current section
  const handleOpenDetailCard = (section: SectionData) => {
    if (section.isFinalExperience && section.finalExperienceDetails) {
        // Data for the final experience section's card
        setOpenedCardData({
            title: section.finalExperienceDetails.title,
            description: section.finalExperienceDetails.description,
            content: section.finalExperienceDetails.content,
            videoSrc: section.finalExperienceVideoSrc // Specific video for this card
        });
    } else if (section.discoverCardTitle && section.discoverCardDescription && section.discoverCardContent) {
        // Data for regular sections' cards
         setOpenedCardData({
            title: section.discoverCardTitle,
            description: section.discoverCardDescription,
            content: section.discoverCardContent,
            // videoSrc: undefined // Regular sections might not have a video in their card by default
        });
    }
    setIsDetailCardOpen(true); // Open the card
  };

  // Effect for handling keyboard navigation (arrow keys for scrolling, Escape to close detail card)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDetailCardOpen && e.key === 'Escape') {
        setIsDetailCardOpen(false);
        setOpenedCardData(null);
        return; // Prevent further action if card was closed
      }
      if (!isDetailCardOpen) { // Only allow arrow key scroll if no card is open
        if (e.key === 'ArrowRight') {
          handleNext();
        } else if (e.key === 'ArrowLeft') {
          handlePrev();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSection, sections.length, isDetailCardOpen]); // Dependencies for re-binding if these change

  // Effect to scroll the main container smoothly when currentSection changes
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
      {sections.map((section, index) => {
        const isFinal = section.isFinalExperience;
        // Determine the label for the discover button based on the section type
        const discoverButtonLabel = isFinal ? section.finalExperienceDiscoverButtonText : section.discoverButtonText;

        return (
          <div
            key={section.id}
            className="min-w-full h-full flex-shrink-0 relative snap-center"
            id={`section-${index}`}
          >
            <div className="relative h-full w-full">
              {/* Background Video Layer: Full height for final, half height for others */}
              <div className={`absolute left-0 w-full overflow-hidden ${isFinal ? 'top-0 h-full' : 'top-0 h-1/2'}`}>
                <video
                  ref={el => topVideoRefs.current[index] = el}
                  src={section.topVideoSrc}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  onLoadedMetadata={(e) => {
                    // Apply playback rate once metadata is loaded
                    if (e.currentTarget.playbackRate !== playbackRate) {
                      e.currentTarget.playbackRate = playbackRate;
                    }
                  }}
                />
              </div>

              {/* Bottom video Layer (Only for non-final sections) */}
              {!isFinal && (
                <div className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden">
                  <video
                    ref={el => bottomVideoRefs.current[index] = el}
                    src={section.bottomVideoSrc}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    onLoadedMetadata={(e) => {
                      // Apply playback rate
                      if (e.currentTarget.playbackRate !== playbackRate) {
                        e.currentTarget.playbackRate = playbackRate;
                      }
                    }}
                  />
                </div>
              )}
              {/* Content Overlay Area - Discover Button (triggers the modal) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                {discoverButtonLabel && !isDetailCardOpen && (
                  <Button
                    onClick={() => handleOpenDetailCard(section)}
                    className="text-md sm:text-lg font-semibold text-white bg-black/50 px-6 rounded-full py-2.5 shadow-xl backdrop-blur-md animate-fade-in hover:bg-black/70 transition-colors duration-200"
                  >
                    {discoverButtonLabel}
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}

        {/* Detail Card Modal - Rendered centrally when isDetailCardOpen is true */}
        {isDetailCardOpen && openedCardData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 transition-opacity duration-300 ease-in-out opacity-100">
                <Card className="w-[90vw] max-w-lg animate-scale-up bg-black/85 backdrop-blur-xl text-white border border-white/30 shadow-2xl">
                <CardHeader className="relative pt-6 pr-6 pl-6 pb-4">
                    {/* Close button for the card */}
                    <Button
                    variant="ghost"
                    className="absolute right-3 top-3 text-white/70 hover:bg-white/10 hover:text-white rounded-full h-9 w-9 p-0"
                    onClick={() => { setIsDetailCardOpen(false); setOpenedCardData(null); }}
                    aria-label="Close details"
                    >
                    <X size={20} />
                    </Button>
                    <CardTitle className="text-2xl sm:text-3xl font-semibold mr-8">{openedCardData.title}</CardTitle>
                    <CardDescription className="text-gray-300 pt-1 text-sm sm:text-base">{openedCardData.description}</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm sm:prose-base prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-ul:text-gray-300 prose-li:marker:text-gray-400 max-h-[60vh] sm:max-h-[50vh] overflow-y-auto text-gray-200 px-6 pb-6">
                    {/* Optional: Video inside the card */}
                    {openedCardData.videoSrc && (
                    <video
                        src={openedCardData.videoSrc}
                        className="w-full h-56 object-cover rounded-md my-4 shadow-lg" // Height is h-56
                        autoPlay
                        loop
                        muted
                        playsInline
                        onLoadedMetadata={(e) => {
                        if (e.currentTarget.playbackRate !== playbackRate) {
                            e.currentTarget.playbackRate = playbackRate;
                        }
                        }}
                    />
                    )}
                    {/* Markdown content rendering */}
                    <ReactMarkdown
                      components={{
                        h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-4 mb-2 text-white" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="text-gray-300" {...props} />,
                        p: ({node, ...props}) => <p className="text-gray-300 mb-2" {...props} />,
                        a: ({node, ...props}) => <a className="text-sky-400 hover:text-sky-300 underline" target="_blank" rel="noopener noreferrer" {...props} />
                      }}
                    >
                        {openedCardData.content}
                    </ReactMarkdown>
                </CardContent>
                <CardFooter className="flex justify-end pt-2 pb-4 px-6">
                    {/* MODIFIED CLOSE BUTTON STYLING */}
                    <Button
                      variant="outline" // Keeps some base button structure
                      onClick={() => { setIsDetailCardOpen(false); setOpenedCardData(null); }}
                      // Explicitly set background to transparent, text to white, and border to a visible white.
                      // Added focus-visible:ring-white for better focus indication.
                      className="bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
                    >
                      Close
                    </Button>
                </CardFooter>
                </Card>
            </div>
        )}

      {/* Navigation controls for scrolling - Visible when detail card is NOT open */}
      {!isDetailCardOpen && (
        <>
          <button
            onClick={handlePrev}
            disabled={currentSection === 0}
            className={`fixed left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/25 text-white transition-all duration-200 ease-in-out hover:bg-black/60 hover:scale-105
              ${currentSection === 0 ? 'opacity-0 scale-75 cursor-not-allowed pointer-events-none' : 'opacity-70 hover:opacity-100'}`}
            aria-label="Previous section"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={handleNext}
            disabled={currentSection === sections.length - 1}
            className={`fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/25 text-white transition-all duration-200 ease-in-out hover:bg-black/60 hover:scale-105
              ${currentSection === sections.length - 1 ? 'opacity-0 scale-75 cursor-not-allowed pointer-events-none' : 'opacity-70 hover:opacity-100'}`}
            aria-label="Next section"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Section dot indicators - Visible when detail card is NOT open */}
      {!isDetailCardOpen && sections.length > 1 && (
        <div className="fixed bottom-6 right-1/2 translate-x-1/2 md:right-6 md:translate-x-0 md:left-auto z-20 flex space-x-2.5 animate-fade-in">
          {sections.map((_, i) => (
            <button
              key={i}
              className={`block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ease-out transform focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black/50
                ${currentSection === i ? 'bg-white scale-125 shadow-lg' : 'bg-white/40 hover:bg-white/70 active:bg-white/90 hover:scale-110'}`}
              onClick={() => updateCurrentSection(i)}
              aria-label={`Go to section ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HorizontalScroller;
