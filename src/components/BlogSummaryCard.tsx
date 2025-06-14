import React, { useState } from 'react';
import { BlogSummary } from './BlogCarousel';
import Image from 'next/image';

interface BlogSummaryCardProps {
  summary: BlogSummary;
}

const BlogSummaryCard: React.FC<BlogSummaryCardProps> = ({ summary }) => {
  // Track if thumbnail failed to load (to use fallback)
  const [thumbnailError, setThumbnailError] = useState(false);

  // Function to handle YouTube video click
  const handleYouTubeClick = (url: string) => {
    // Open YouTube link in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Handle image loading error by setting error state
  const handleImageError = () => {
    setThumbnailError(true);
  };
  return (
    <div className="border border-gray-200 rounded p-4 h-full flex flex-col bg-white">
      {/* Card Header with thumbnail or YouTube thumbnail */}
      <div className="mb-3">
        {summary.youtube_thumbnail && summary.youtube_video ? (
          <div 
            className="relative h-40 w-full mb-3 rounded overflow-hidden border border-gray-200 cursor-pointer"
            onClick={() => handleYouTubeClick(summary.youtube_video || '')}
            role="button"
            tabIndex={0}
            aria-label={`Watch video: ${summary.title}`}
            onKeyDown={(e) => e.key === 'Enter' && summary.youtube_video && handleYouTubeClick(summary.youtube_video)}
          >
            <div className="h-full w-full relative">
              {/* YouTube thumbnail with fallback handling */}
              <div 
                className="h-full w-full bg-cover bg-center" 
                style={{ 
                  backgroundImage: `url('${thumbnailError ? '/trump-thumbnail.jpg' : summary.youtube_thumbnail}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Hidden image to detect load errors */}
                <Image 
                  src={summary.youtube_thumbnail}
                  alt=""
                  width={1}
                  height={1}
                  className="hidden"
                  onError={handleImageError}
                />
              </div>
              
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                  <div className="w-0 h-0 border-t-5 border-t-transparent border-l-8 border-l-white border-b-5 border-b-transparent ml-1"></div>
                </div>
              </div>
            </div>
          </div>
        ) : summary.thumbnail && (
          <div className="relative h-40 w-full mb-3 rounded overflow-hidden border border-gray-200">
            {/* Handle images safely - use a div with background for external URLs */}
            <div 
              className="h-full w-full bg-cover bg-center" 
              style={{ 
                backgroundImage: `url('${summary.thumbnail}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          </div>
        )}
        <h3 className="text-md font-bold line-clamp-2 text-black">{summary.title}</h3>
      </div>
      
      {/* Card Body */}
      <div className="flex-grow">
        <p className="text-sm text-black line-clamp-3">
          {summary.summary}
        </p>
      </div>
      
      {/* Card Footer */}
      <div className="mt-3 flex flex-col justify-end gap-2">
        {summary.youtube_video && (
          <a 
            href={summary.youtube_video} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center"
            onClick={(e) => {
              e.preventDefault();
              handleYouTubeClick(summary.youtube_video || '');
            }}
          >
            <svg className="w-4 h-4 mr-1 fill-current text-red-600" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Watch on YouTube
          </a>
        )}
        
        {summary.source && (
          <div className="text-xs text-black">
            Summary by {summary.source}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogSummaryCard;
