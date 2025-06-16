import React, { useState } from 'react';
import BlogSummaryCard from './BlogSummaryCard';

// Sample data structure for blog summaries
export interface BlogSummary {
  id: string;
  summary1: string;
  summary2: string;
  summary3: string;
  source?: string;
  thumbnail?: string;
  youtube_video?: string;
  youtube_thumbnail?: string;
}

interface BlogCarouselProps {
  summaries: BlogSummary[];
  title?: string;
  isNew?: boolean;
}

const BlogCarousel: React.FC<BlogCarouselProps> = ({ summaries }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Calculate the number of cards to display based on viewport width
  // This would typically be handled with CSS media queries and responsive design
  const cardsToShow = 2;

  // Handle navigation through cards
  const goToPrev = () => {
    setCurrentIndex(prev => 
      prev === 0 ? Math.max(0, summaries.length - cardsToShow) : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex(prev => 
      prev >= summaries.length - cardsToShow ? 0 : prev + 1
    );
  };
  
  // Direct navigation to specific page
  const goToPage = (pageIndex: number) => {
    // Calculate the correct index based on cards per page
    const newIndex = pageIndex * cardsToShow;
    // Make sure we don't exceed array bounds
    setCurrentIndex(Math.min(newIndex, Math.max(0, summaries.length - cardsToShow)));
  };

  return (
    <div className="w-full max-w-screen-lg mx-auto py-4 bg-white">
      {/* Takeaways header temporarily hidden */}
      
      {/* Carousel container */}
      <div className="flex items-center justify-center relative mx-auto max-w-4xl">
        {/* Left arrow */}
        {summaries.length > cardsToShow && (
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md border border-gray-200 text-black font-bold"
            aria-label="Previous"
          >
            ←
          </button>
        )}
        
        {/* Fixed width carousel container with appropriate padding */}
        <div className="overflow-hidden w-full mx-10"> {/* mx-10 provides space for arrows */}
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / cardsToShow)}%)` }}
          >
            {summaries.map((summary) => (
              <div 
                key={summary.id} 
                className="w-1/2 flex-shrink-0 px-3"
              >
                <BlogSummaryCard summary={summary} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Right arrow */}
        {summaries.length > cardsToShow && (
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md border border-gray-200 text-black font-bold"
            aria-label="Next"
          >
            →
          </button>
        )}
      </div>
      
      {/* Navigation dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: Math.ceil(summaries.length / cardsToShow) }).map((_, i) => {
          // Calculate current page based on currentIndex
          const currentPage = Math.floor(currentIndex / cardsToShow);
          const isActive = i === currentPage;
          return (
            <button
              key={`nav-dot-${i}`}
              onClick={() => goToPage(i)}
              className={`w-3 h-3 rounded-full transition-colors ${isActive ? 'bg-black' : 'bg-gray-300 hover:bg-gray-400'}`}
              aria-label={`Go to page ${i + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default BlogCarousel;
