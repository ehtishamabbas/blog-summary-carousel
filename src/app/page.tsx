'use client';

import { useEffect, useState } from 'react';
import BlogCarousel from '@/components/BlogCarousel';
import MobileBlogCarousel from '@/components/MobileBlogCarousel';
import { fetchBlogSummaries } from '@/lib/api';
import { BlogSummary } from '@/components/BlogCarousel';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Client-side utility to get query params
function getQueryParam(name: string): string | null {
  // Use window only after component has mounted
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

export default function Home() {
  const [blogSummaries, setBlogSummaries] = useState<BlogSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Effect to load blog summaries with timeout logic
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      // Abort after 1 minute
      controller.abort('Timeout after 60 seconds');
      console.log('Supabase fetch timed out after 60 seconds');
    }, 60000); // 1 minute timeout
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Get postId from URL (support both post_id and postId formats)
        const id = getQueryParam('post_id') || getQueryParam('postId');
        
        // Log post ID for testing purposes
        console.log('TESTING - Post ID:', id || 'None');
        
        try {
          // Fetch data from API (which will use Supabase or fallbacks)
          const data = await fetchBlogSummaries({
            postId: id || undefined,
            signal: controller.signal // Pass abort signal to API
          });
          
          if (data && data.length > 0) {
            // Set the data directly - no need for transformations as the API now returns
            // properly formatted BlogSummary objects for all 4 carousel positions
            setBlogSummaries(data);
            console.log('Successfully loaded blog summaries, count:', data.length);
          }
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            console.log('Request was aborted');
          } else {
            console.error('Error fetching blog data:', error);
          }
        }
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      controller.abort('Component unmounted');
    };
  }, []); // Only run once on mount

  const isMobileLayoutBoundary = useMediaQuery('(max-width: 450px)');
  
  return (
    <div className="h-screen w-full overflow-hidden bg-white">
      {isLoading ? (
        // Show loader while fetching data (max 1 minute)
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-black font-medium">Loading blog highlights...</p>
          </div>
        </div>
      ) : (
        // Conditionally render either mobile or desktop carousel based on viewport size
        <>
          {isMobileLayoutBoundary ? (
            <MobileBlogCarousel summaries={blogSummaries} />
          ) : (
            <BlogCarousel 
              summaries={blogSummaries} 
              title="Blog Highlights" 
              isNew={false} 
            />
          )}
        </>
      )}
    </div>
  );
}
