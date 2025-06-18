import React, { useState, useRef, TouchEvent, useMemo } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { BlogSummary } from './BlogCarousel';
import Image from 'next/image';

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

interface MobileBlogCarouselProps {
  summaries: BlogSummary[];
}



const MobileBlogCarousel: React.FC<MobileBlogCarouselProps> = ({ summaries }) => {
  
  const showMobileLayout = useMediaQuery('(max-width: 450px)');
  const [currentPage, setCurrentPage] = useState(0);
  const [thumbnailError, setThumbnailError] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Function to handle YouTube video click
  const handleYouTubeClick = (url: string) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Handle image loading error by setting error state
  const handleImageError = () => {
    setThumbnailError(true);
  };
  
  // We need exactly 4 summaries (3 visible initially + 1 for related content)
  const normalizedSummaries = summaries.slice(0, 4);
  while (normalizedSummaries.length < 4) {
    normalizedSummaries.push({
      id: `empty-${normalizedSummaries.length}`,
      summary1: '',
      summary2: '',
      summary3: '',
      related_posts: [], // Or undefined, to match interface consistently
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
      if (diffX > 0) { // Swiped left
        setCurrentPage(prev => Math.min(prev + 1, 2)); // Go to next page, max 2
      } else if (diffX < 0) { // Swiped right
        setCurrentPage(prev => Math.max(prev - 1, 0)); // Go to previous page, min 0
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
  
  const postsToDisplayForMobile = useMemo(() => {
    const related = normalizedSummaries[3]?.related_posts || [];
    if (related.length === 0) {
      return []; 
    }
    if (related.length < 3) {
      return related; 
    }
    if (related.length === 3) {
      return shuffleArray(related); 
    }
    return shuffleArray(related).slice(0, 3); 
  }, [normalizedSummaries]); // Dependency on normalizedSummaries as it contains related_posts for index 3

  if (!showMobileLayout) {
    return null;
  }

  return (
    <div className="w-full">
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
          {/* Page 1: Key Points & Analysis (2 panels) */}
          <div className="w-full flex-shrink-0 flex flex-col" > {/* Adjusted height */}
            <div className="flex w-full h-[160px]">
              {/* Panel 1: Key Points */}
              <div className="flex-1 p-1">
                <div className="bg-white h-full rounded-sm p-3 flex flex-col border border-gray-200">
                  <div className="flex-grow overflow-y-auto mb-2 pt-1 max-h-[250px]">
                    <p className="text-xs text-gray-700 mb-3">• {normalizedSummaries[0]?.summary1 || 'No summary available.'}</p>
                    <p className="text-xs text-gray-700">• {normalizedSummaries[2]?.summary2 || 'No summary available.'}</p>
                    <p className="text-xs text-gray-700">• {normalizedSummaries[3]?.summary3 || 'No summary available.'}</p>
                  </div>
                  {normalizedSummaries[0]?.source && (
                    <div className="mt-auto pt-1 text-[10px] leading-tight text-gray-600 border-t border-gray-100">
                      Summary by {normalizedSummaries[0].source}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Panel 2: Analysis */}
              <div className="flex-1 p-1">
            <div className="p-1 h-full">
              <div className="bg-white h-full rounded-sm p-3 flex flex-col border border-gray-200">
                {postsToDisplayForMobile.length > 0 ? (
                  <>
                    <h3 className="text-sm font-semibold mb-1 text-black">Top Stories</h3>
                    <ul className="list-none flex-grow overflow-y-auto mb-2 pt-1">
                      {postsToDisplayForMobile.map((post, index) => (
                        <li key={index}>
                          •
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            {post.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                    {/* Optionally, you can add a source for related articles if available in your data model */}
                    {/* {normalizedSummaries[3]?.source && (
                      <div className="mt-auto pt-1 text-[10px] leading-tight text-gray-600 border-t border-gray-100">
                        Source: {normalizedSummaries[3].source}
                      </div>
                    )} */}
                  </>
                ) : (
                  <>
                    <div className="flex-grow overflow-y-auto mb-2 pt-1">
                      <p className="text-xs text-gray-700 line-clamp-6 min-h-[5em]">
                        {normalizedSummaries[3]?.summary3 ? `• ${smartTruncateText(normalizedSummaries[3].summary3, 400)}` : 'No related content available.'}
                      </p>
                    </div>
                    {normalizedSummaries[3]?.source && (
                      <div className="mt-auto pt-1 text-[10px] leading-tight text-gray-600 border-t border-gray-100">
                        Summary by {normalizedSummaries[3].source}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
            </div>
          </div>

          {/* Page 2: YouTube Video (1 panel) */}
          <div className="w-full flex-shrink-0" > {/* Adjusted height */}
            <div className="p-1 h-full">
              <div className="bg-white h-full rounded-sm p-3 flex flex-col border border-gray-200">
                <div className="flex-grow flex flex-col items-center justify-center pt-1">
                  {normalizedSummaries[1]?.youtube_video && normalizedSummaries[1]?.youtube_thumbnail ? (
                    <div 
                      className="relative h-28 w-full mb-2 rounded overflow-hidden border border-gray-200 cursor-pointer"
                      onClick={() => handleYouTubeClick(normalizedSummaries[1].youtube_video || '')}
                      role="button"
                      tabIndex={0}
                      aria-label="Watch video"
                      onKeyDown={(e) => e.key === 'Enter' && normalizedSummaries[1].youtube_video && handleYouTubeClick(normalizedSummaries[1].youtube_video)}
                    >
                      <div className="h-full w-full relative"> 
                        <div 
                          className="h-full w-full bg-cover bg-center" 
                          style={{ 
                            backgroundImage: `url('${thumbnailError ? '/trump-thumbnail.jpg' : normalizedSummaries[1].youtube_thumbnail}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          <Image 
                            src={normalizedSummaries[1].youtube_thumbnail || ''} // Use index 1 for thumbnail source
                            alt="Video thumbnail"
                            width={1}
                            height={1}
                            className="hidden"
                            onError={handleImageError} // This will use the component's thumbnailError state, which is fine
                          />
                        </div>
                        <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${(thumbnailError || !normalizedSummaries[1].youtube_thumbnail) ? 'bg-black bg-opacity-20 hover:bg-opacity-30' : 'hover:bg-black hover:bg-opacity-10'}`}> 
                          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">No video available</div>
                  )}
                </div>
                {normalizedSummaries[1]?.youtube_video && ( // Use index 1 for video link
                  <div className="mt-auto pt-1 border-t border-gray-100">
                    <a 
                      href={normalizedSummaries[1].youtube_video} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center justify-center"
                      onClick={(e) => {
                        e.preventDefault();
                        handleYouTubeClick(normalizedSummaries[1].youtube_video || '');
                      }}
                    >
                      <svg className="w-4 h-4 mr-1 fill-current text-red-600" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      Watch on YouTube
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Page indicators */}
      <div className="flex justify-center space-x-1.5"> 
        <button 
          onClick={() => setCurrentPage(0)} 
          className={`w-2 h-2 rounded-full ${currentPage === 0 ? 'bg-black' : 'bg-gray-300'}`}
          aria-label="Page 1: Summaries"
        />
        <button 
          onClick={() => setCurrentPage(1)}
          className={`w-2 h-2 rounded-full ${currentPage === 1 ? 'bg-black' : 'bg-gray-300'}`}
          aria-label="Page 2: Video"
        />
      </div>
    </div>
  );
};

export default MobileBlogCarousel;
