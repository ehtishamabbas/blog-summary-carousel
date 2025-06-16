import React, { useState, useRef, TouchEvent } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { BlogSummary } from './BlogCarousel';
import Image from 'next/image';

interface MobileBlogCarouselProps {
  summaries: BlogSummary[];
}

const MobileBlogCarousel: React.FC<MobileBlogCarouselProps> = ({ summaries }) => {
  const showMobileLayout = useMediaQuery('(max-width: 450px)');
  const [currentPage, setCurrentPage] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  
  // We need exactly 4 summaries (3 visible initially + 1 for related content)
  const normalizedSummaries = summaries.slice(0, 4);
  while (normalizedSummaries.length < 4) {
    normalizedSummaries.push({
      id: `empty-${normalizedSummaries.length}`,
      summary1: '',
      summary2: '',
      summary3: '',
    });
  }
  
  // Handle touch events for swipe navigation
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const diffX = touchStartX.current - touchEndX.current;
    const threshold = 50; // Minimum distance required for a swipe
    
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0 && currentPage === 0) {
        // Swiped left - go to related content page
        setCurrentPage(1);
      } else if (diffX < 0 && currentPage === 1) {
        // Swiped right - go back to main panels
        setCurrentPage(0);
      }
    }
    
    // Reset values
    touchStartX.current = null;
    touchEndX.current = null;
  };
  
  // Smart text truncation function that tries to end at a sentence boundary
  const smartTruncateText = (text: string, maxLength: number = 300): string => {
    if (!text || text.length <= maxLength) return text || '';
    
    // Try to find the last sentence boundary within the maxLength
    const truncated = text.substring(0, maxLength);
    
    // Look for the last period followed by a space or the end of the truncated text
    const lastPeriodIndex = truncated.lastIndexOf('.');
    
    if (lastPeriodIndex > maxLength * 0.6) { // Only use period if we're not cutting off too much
      return truncated.substring(0, lastPeriodIndex + 1);
    }
    
    // Fall back to seeking the last complete word
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    if (lastSpaceIndex > 0) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }
    
    // If all else fails, just truncate
    return truncated + '...';
  };
  
  if (!showMobileLayout) {
    return null;
  }

  return (
    <div className="w-full bg-gray-50">
      <div 
        className="w-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          {/* First page: 3 panels side by side */}
          <div className="w-full flex-shrink-0 flex flex-col" style={{ height: 'calc(100vw/3)' }}>
            <div className="flex w-full h-full">
              {/* Panel 1: Summary 1 */}
              <div className="flex-1 p-1">
                <div className="bg-white h-full rounded-sm p-2 flex flex-col">
                  <h3 className="text-xs font-semibold mb-1">Key Points</h3>
                  <div className="flex-1 overflow-y-auto">
                    <p className="text-xs">{smartTruncateText(normalizedSummaries[0]?.summary1, 150)}</p>
                  </div>
                </div>
              </div>
              
              {/* Panel 2: Summary 2 */}
              <div className="flex-1 p-1">
                <div className="bg-white h-full rounded-sm p-2 flex flex-col">
                  <h3 className="text-xs font-semibold mb-1">Analysis</h3>
                  <div className="flex-1 overflow-y-auto">
                    <p className="text-xs">{smartTruncateText(normalizedSummaries[0]?.summary2, 150)}</p>
                  </div>
                </div>
              </div>
              
              {/* Panel 3: YouTube Video */}
              <div className="flex-1 p-1">
                <div className="bg-white h-full rounded-sm p-2 flex flex-col">
                  <h3 className="text-xs font-semibold mb-1">Video</h3>
                  <div className="flex-1 flex items-center justify-center">
                    {normalizedSummaries[0]?.youtube_video && normalizedSummaries[0]?.youtube_thumbnail ? (
                      <a 
                        href={normalizedSummaries[0].youtube_video} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="relative w-full h-full block"
                      >
                        <div 
                          className="absolute inset-0 bg-cover bg-center" 
                          style={{ 
                            backgroundImage: `url('${normalizedSummaries[0].youtube_thumbnail}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                          <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                            <div className="w-0 h-0 border-t-3 border-t-transparent border-l-4 border-l-white border-b-3 border-b-transparent ml-0.5"></div>
                          </div>
                        </div>
                      </a>
                    ) : (
                      <div className="text-xs text-gray-500">No video</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Second page: Related content (4th panel) */}
          <div className="w-full flex-shrink-0" style={{ height: 'calc(100vw/3)' }}>
            <div className="p-1 h-full">
              <div className="bg-white h-full rounded-sm p-2 flex flex-col">
                <h3 className="text-xs font-semibold mb-1">Related Content</h3>
                <div className="flex-1 overflow-y-auto">
                  <p className="text-xs">{smartTruncateText(normalizedSummaries[0]?.summary3, 400)}</p>
                </div>
                {normalizedSummaries[0]?.source && (
                  <div className="text-xs mt-1">Source: {normalizedSummaries[0].source}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Page indicators */}
      <div className="flex justify-center mt-2 space-x-2">
        <button 
          onClick={() => setCurrentPage(0)} 
          className={`w-2 h-2 rounded-full ${currentPage === 0 ? 'bg-black' : 'bg-gray-300'}`}
          aria-label="Main panels"
        />
        <button 
          onClick={() => setCurrentPage(1)}
          className={`w-2 h-2 rounded-full ${currentPage === 1 ? 'bg-black' : 'bg-gray-300'}`}
          aria-label="Related content"
        />
      </div>
    </div>
  );
};

export default MobileBlogCarousel;
