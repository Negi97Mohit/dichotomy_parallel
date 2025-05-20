
import React, { useState, useRef } from 'react';

interface VideoScreenProps {
  videoSrc: string;
  position: 'top' | 'bottom' | 'full';
  className?: string;
  isMerging?: boolean;
}

const VideoScreen: React.FC<VideoScreenProps> = ({ 
  videoSrc, 
  position, 
  className = "", 
  isMerging = false 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  return (
    <div 
      className={`
        ${position === 'top' ? 'top-0' : position === 'bottom' ? 'bottom-0' : 'inset-0'} 
        ${position !== 'full' ? 'h-1/2' : 'h-full'} 
        ${isMerging && position !== 'full' ? 'animate-merge-screens' : ''}
        absolute w-full overflow-hidden ${className}
      `}
    >
      <video 
        ref={videoRef}
        className="w-full h-full object-cover"
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  );
};

export default VideoScreen;
