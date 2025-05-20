
import React, { useState, useEffect } from 'react';
import IntroAnimation from '@/components/IntroAnimation';
import VideoScreen from '@/components/VideoScreen';
import DetailButton from '@/components/DetailButton';
import HorizontalScroller from '@/components/HorizontalScroller';

// Sample data for the sections
const sections = [
  {
    id: 1,
    topVideoSrc: "./assets/1b.mp4",
    bottomVideoSrc: "https://assets.mixkit.co/videos/preview/mixkit-man-under-multicolored-lights-1237-large.mp4",
    buttonTitle: "Experience Innovation",
    buttonDescription: "Discover our unique approach",
    buttonContent: "Our methodology combines cutting-edge technologies with human-centered design principles. We create experiences that are both innovative and intuitive, pushing the boundaries of what's possible while ensuring usability and accessibility."
  },
  {
    id: 2,
    topVideoSrc: "https://assets.mixkit.co/videos/preview/mixkit-traffic-and-flickering-billboards-at-night-34562-large.mp4",
    bottomVideoSrc: "https://assets.mixkit.co/videos/preview/mixkit-white-sand-beach-and-palm-trees-1564-large.mp4",
    buttonTitle: "Design Language",
    buttonDescription: "Our visual philosophy",
    buttonContent: "We believe in the power of clean, purposeful design that communicates clearly while creating emotional connections. Every element serves a purpose, every interaction tells a story, and every detail matters in creating a cohesive experience."
  },
  {
    id: 3,
    topVideoSrc: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-finishing-working-out-40047-large.mp4",
    bottomVideoSrc: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4",
    buttonTitle: "Technology & Future",
    buttonDescription: "What drives us forward",
    buttonContent: "We're constantly exploring emerging technologies and future trends, integrating them thoughtfully into our work. From immersive experiences to sustainable solutions, we're committed to creating work that's both forward-thinking and responsible."
  },
  {
    id: 4,
    topVideoSrc: "https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4",
    bottomVideoSrc: "https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4",
    buttonTitle: "Our Vision",
    buttonDescription: "The complete picture",
    buttonContent: "This is where everything comes together. Our vision encompasses all aspects of design, technology, and human experience, creating a unified approach that transcends individual disciplines and creates truly transformative solutions."
  },
];

const Index = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [mergeScreens, setMergeScreens] = useState(false);
  const [showFinalVideo, setShowFinalVideo] = useState(false);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setShowContent(true);
  };
  
  const handleFinalSection = () => {
    setMergeScreens(true);
    
    setTimeout(() => {
      setShowFinalVideo(true);
    }, 1500); // Wait for merge animation to complete
  };

  const handleGoBack = () => {
    setShowFinalVideo(false);
    setMergeScreens(false);
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-black relative">
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      
      {showContent && !showFinalVideo && (
        <>
          {/* Initial split screen with two videos */}
          <HorizontalScroller 
            sections={sections} 
            onFinalSection={handleFinalSection} 
            showFinalVideo={showFinalVideo}
          />
        </>
      )}
      
      {showFinalVideo && (
        <div className="absolute inset-0 z-40">
          <VideoScreen 
            videoSrc="https://assets.mixkit.co/videos/preview/mixkit-view-of-a-bright-galaxy-4872-large.mp4"
            position="full"
            className="animate-fade-in"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8">
            <p className="text-white text-3xl md:text-5xl font-bold animate-fade-in">
              The Complete Experience
            </p>
            <button 
              onClick={handleGoBack}
              className="animate-fade-in mt-8 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full backdrop-blur-sm border border-white/20 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;