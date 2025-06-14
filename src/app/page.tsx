'use client';

import { useEffect, useState } from 'react';
import BlogCarousel from '@/components/BlogCarousel';
import { fetchBlogSummaries } from '@/lib/api';
import { BlogSummary } from '@/components/BlogCarousel';

// Trump news video fallback for second carousel card
const TRUMP_NEWS_FALLBACK = {
  youtube_video: 'https://www.youtube.com/watch?v=dGKKIg-ZUkE',
  // Using local thumbnail image to avoid YouTube black thumbnail issue
  youtube_thumbnail: '/trump-thumbnail.jpg',
  title: 'Latest Trump News & Updates',
  summary: 'Get the latest updates on President Trump including policy announcements, campaign events, and key developments in American politics.'
};

// Client-side utility to get query params
function getQueryParam(name: string): string | null {
  // Use window only after component has mounted
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Note: We no longer need placeholder data as api.ts provides mockBlogSummaries as default

export default function Home() {
  const [blogSummaries, setBlogSummaries] = useState<BlogSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Effect to load blog summaries with timeout logic
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      // Abort after 1 minute
      controller.abort('Timeout after 60 seconds');
      console.log('Supabase fetch timed out after 60 seconds, using fallback data');
    }, 60000); // 1 minute timeout
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Get postId from URL (support both post_id and postId formats)
        const id = getQueryParam('post_id') || getQueryParam('postId');
        
        // Log post ID for testing purposes
        console.log('TESTING - Post ID:', id || 'None');
        
        // Create a promise that can be used with a timeout
        const fetchWithTimeout = async () => {
          try {
            // Try to fetch from Supabase with abort signal
            const data = await fetchBlogSummaries({
              postId: id || undefined,
              signal: controller.signal // Pass abort signal to API
            });
            
            if (data && data.length > 0) {
              // Duplicate the summaries to have 3-4 items for testing/display
              const firstItem = data[0];
              
              // Create duplicates with slightly modified content
              const duplicatedData = [
                // First card - standard, no YouTube video
                {
                  ...firstItem,
                  // Explicitly remove YouTube properties from first card
                  youtube_video: undefined,
                  youtube_thumbnail: undefined
                },
                // Second card - always has YouTube video (from Supabase or fallback)
                {
                  // Second card always has YouTube video link (use data from Supabase if available or fallback to Trump news)
                  ...firstItem,
                  id: `${firstItem.id}-dup-1`,
                  title: firstItem.youtube_video ? `${firstItem.title} - Key Insights` : TRUMP_NEWS_FALLBACK.title,
                  summary: firstItem.youtube_video ? 
                    `Key insights from this article: ${firstItem.summary.substring(0, 100)}...` : 
                    TRUMP_NEWS_FALLBACK.summary,
                  youtube_video: firstItem.youtube_video || TRUMP_NEWS_FALLBACK.youtube_video,
                  // Better thumbnail handling - prioritize Supabase thumbnail if it exists and appears valid
                  youtube_thumbnail: (firstItem.youtube_thumbnail && firstItem.youtube_thumbnail.trim() !== '') ? 
                    firstItem.youtube_thumbnail : 
                    TRUMP_NEWS_FALLBACK.youtube_thumbnail
                },
                // Third card - summary only, no YouTube video
                {
                  ...firstItem,
                  id: `${firstItem.id}-dup-2`,
                  title: `${firstItem.title} - Summary`,
                  summary: `A brief summary: ${firstItem.summary.substring(50, 150)}...`,
                  // Explicitly remove YouTube properties
                  youtube_video: undefined,
                  youtube_thumbnail: undefined
                },
                // Fourth card - conclusion only, no YouTube video
                {
                  ...firstItem,
                  id: `${firstItem.id}-dup-3`,
                  title: `${firstItem.title} - Conclusion`,
                  summary: `In conclusion: ${firstItem.summary.substring(20, 120)}...`,
                  // Explicitly remove YouTube properties
                  youtube_video: undefined,
                  youtube_thumbnail: undefined
                }
              ];
              
              return duplicatedData;
            }
            return null;
          } catch (error) {
            console.error('Error fetching from Supabase:', error);
            throw error;
          }
        };
        
        // Try to fetch with timeout
        const result = await fetchWithTimeout();
        
        // If we have data, use it
        if (result) {
          setBlogSummaries(result);
          console.log('Successfully loaded data from Supabase');
        }
      } catch (err) {
        console.error('Failed to fetch blog data:', err);
        // Error handling is done in finally block to ensure loading state is updated
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
  
  return (
    <div className="h-screen w-full overflow-hidden bg-white">
      {isLoading ? (
        // Show loader while fetching from Supabase (max 1 minute)
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-black font-medium">Loading blog highlights...</p>
          </div>
        </div>
      ) : (
        // Show carousel with data after loading or timeout
        <BlogCarousel 
          summaries={blogSummaries} 
          title="Blog Highlights" 
          isNew={false} 
        />
      )}
    </div>
  );
}
