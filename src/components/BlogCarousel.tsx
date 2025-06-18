import React, { useState } from 'react';
import BlogSummaryCard from './BlogSummaryCard';
import SummariesOnlyDisplay from './SummariesOnlyDisplay';
import TopStoriesDisplay from './TopStoriesDisplay';

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
  related_posts?: Array<{ title: string; url: string }>;
}

interface BlogCarouselProps {
  summaries: BlogSummary[];
  title?: string;
  isNew?: boolean;
}

const BlogCarousel: React.FC<BlogCarouselProps> = ({ summaries = [] }) => { // Added default for summaries
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsToShow = 2; // Desktop shows 2 cards side-by-side

  const carouselCardsData: Array<{
    id: string;
    type: 'summaries' | 'video' | 'topStories';
    props: any; 
  }> = [];

  // Card 1: SummariesOnlyDisplay
  if (summaries.length > 0 && summaries[0]) { // summaries[0] provides summary1
    carouselCardsData.push({
      // Attempt to use a base ID by removing specific suffixes if they exist
      id: 'summaries-card-' + (summaries[0]?.id.replace(/-s1|-yt|-s2|-s3$/, '') || 's0'),
      type: 'summaries',
      props: {
        summary1: summaries[0]?.summary1,
        // summary2 comes from the third object from createBlogSummaries (index 2)
        summary2: summaries.length > 2 ? summaries[2]?.summary2 : null, 
        // summary3 comes from the fourth object from createBlogSummaries (index 3)
        summary3: summaries.length > 3 ? summaries[3]?.summary3 : null,
      },
    });
  }

  // Card 2: BlogSummaryCard (Video)
  // Video data is in summaries[1] (second object from createBlogSummaries)
  if (summaries.length > 1 && summaries[1]?.youtube_video) { 
    carouselCardsData.push({
      id: 'video-card-' + (summaries[1]?.id.replace(/-s1|-yt|-s2|-s3$/, '') || 'yt0'),
      type: 'video',
      props: {
        summary: summaries[1], // Pass the whole summaries[1] object which is dedicated to video
      },
    });
  }

  // Card 3: TopStoriesDisplay
  // related_posts are in summaries[3] (fourth object from createBlogSummaries)
  if (summaries.length > 3 && summaries[3]?.related_posts && summaries[3].related_posts.length > 0) {
    carouselCardsData.push({
      id: 'top-stories-card-' + (summaries[3]?.id.replace(/-s1|-yt|-s2|-s3$/, '') || 'ts0'),
      type: 'topStories',
      props: {
        related_posts: summaries[3].related_posts,
      },
    });
  }

  const goToPrev = () => {
    setCurrentIndex(prev => 
      prev === 0 ? Math.max(0, carouselCardsData.length - cardsToShow) : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex(prev => 
      prev >= carouselCardsData.length - cardsToShow ? 0 : prev + 1
    );
  };
  
  const goToPage = (pageIndex: number) => {
    const newIndex = pageIndex * cardsToShow;
    setCurrentIndex(Math.min(newIndex, Math.max(0, carouselCardsData.length - cardsToShow)));
  };

  return (
    <div className="w-full max-w-screen-lg mx-auto py-4 bg-white">
      {/* Takeaways header temporarily hidden */}
      
      {/* Carousel container */}
      <div className="flex items-center justify-center relative mx-auto max-w-4xl">
        {/* Left arrow */}
        {carouselCardsData.length > cardsToShow && (
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
            className="flex transition-transform duration-300 ease-in-out h-[259px]" // Added h-[450px] for fixed card height
            style={{ transform: `translateX(-${currentIndex * (100 / cardsToShow)}%)` }}
          >
            {carouselCardsData.map((cardData) => (
              <div 
                key={cardData.id} 
                className="w-1/2 flex-shrink-0 px-3 h-full" // Added h-full for consistent card height
              >
                {cardData.type === 'summaries' && <SummariesOnlyDisplay {...cardData.props} />}
                {cardData.type === 'video' && <BlogSummaryCard {...cardData.props} />}
                {cardData.type === 'topStories' && <TopStoriesDisplay {...cardData.props} />}
              </div>
            ))}
          </div>
        </div>
        
        {/* Right arrow */}
        {carouselCardsData.length > cardsToShow && (
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
        {carouselCardsData.length > cardsToShow && Array.from({ length: Math.ceil(carouselCardsData.length / cardsToShow) }).map((_, i) => {
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
