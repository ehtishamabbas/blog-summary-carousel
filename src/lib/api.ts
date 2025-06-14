// Blog summaries service that integrates with Supabase
// Provides both mock data and real Supabase data access

import { BlogSummary } from '@/components/BlogCarousel';
import { fetchPostByPostId, savePost } from './supabase-api';

// Sample data - used as fallback when not connected to Supabase
const mockBlogSummaries: BlogSummary[] = [
  {
    id: '1',
    title: 'Ray Dalio warns that investors are too focused on tariffs',
    summary: 'Ray Dalio warns that investors are too focused on tariffs and not paying enough attention to the breakdown in major monetary, political, and geopolitical orders.',
    source: 'JVPolitical AI',
    thumbnail: '/trump-thumbnail.jpg'
  },
  {
    id: '2',
    title: 'Dalio cites the US debt to finance expenditure',
    summary: 'Dalio cites the US debt to finance expenditure as creditor countries are holding too much, which is one of the key drivers of Trump\'s policies, which will require a correction of the system and a change in the world order.',
    source: 'JVPolitical AI'
  },
  {
    id: '3',
    title: 'Global Economic Shifts and Market Implications',
    summary: 'Analysis of how changing global economic patterns are affecting market dynamics and investment strategies in emerging economies.',
    source: 'JVPolitical AI',
    thumbnail: '/trump-thumbnail.jpg'
  },
  {
    id: '4',
    title: 'Tech Giants Navigate Regulatory Challenges',
    summary: 'Major technology companies are developing new strategies to address increasing regulatory scrutiny across global markets.',
    source: 'JVPolitical AI'
  }
];

interface FetchSummariesOptions {
  limit?: number;
  postId?: string; // Optional param to fetch summaries related to a specific blog post
  signal?: AbortSignal; // Optional AbortSignal to cancel requests
}

export async function fetchBlogSummaries(options: FetchSummariesOptions = {}): Promise<BlogSummary[]> {
  try {
    // If we have a postId, try to fetch data from Supabase first
    if (options.postId) {
      const postIdNum = parseInt(options.postId);
      if (!isNaN(postIdNum)) {
        try {
          // Try to fetch from Supabase with AbortSignal if provided
          const summaries = await fetchPostByPostId(postIdNum, options.signal);
          
          // Check if request was aborted during processing
          if (options.signal?.aborted) {
            console.log('Request aborted during fetchBlogSummaries');
            return [];
          }
          
          if (summaries && summaries.length > 0) {
            console.log('Fetched post data from Supabase:', summaries);
            
            // Update the source to match the branding
            const updatedSummaries = summaries.map(item => ({
              ...item,
              source: 'JVPolitical AI'
            }));
            
            return updatedSummaries;
          } else {
            console.log(`No post found for post_id ${postIdNum}, using mock data`);
          }
        } catch (error) {
          // Don't log as error if it was just aborted
          if (error instanceof DOMException && error.name === 'AbortError') {
            console.log('Supabase request aborted in fetchBlogSummaries');
            return [];
          }
          console.error('Error fetching from Supabase:', error);
          console.log('Falling back to mock data');
        }
      }
    }
    
    // Always return mock data if no post is found or no postId is provided
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulated delay
    
    let results = [...mockBlogSummaries];
    
    // Apply filter for postId if provided
    if (options.postId) {
      // This is just a mock filter - in reality you'd filter by actual relation to the post
      const postIdNum = parseInt(options.postId);
      results = results.filter(summary => {
        const summaryIdNum = parseInt(summary.id);
        return summary.id === options.postId || (summaryIdNum % 2 === postIdNum % 2);
      });
    }
    
    // Apply limit if provided
    if (options.limit && options.limit > 0) {
      results = results.slice(0, options.limit);
    }
    
    return results;
  } catch (error) {
    console.error('Error in fetchBlogSummaries:', error);
    return [];
  }
}

// This function would be used if your WordPress site needs to send data to this app
export async function postBlogSummary(data: Omit<BlogSummary, 'id'>, postId?: number, signal?: AbortSignal): Promise<BlogSummary> {
  try {
    // Generate a new ID for the blog summary
    const newId = String(mockBlogSummaries.length + 1);
    const newSummary: BlogSummary = { id: newId, ...data };
    
    // If we have a postId, try to save to Supabase
    if (postId) {
      try {
        // Save to Supabase with AbortSignal if provided
        await savePost(postId, newSummary, signal);
        console.log('Saved summary to Supabase for post ID:', postId);
      } catch (err) {
        console.warn('Failed to save to Supabase:', err);
        // Continue and return the summary anyway
      }
    }
    
    return newSummary;
  } catch (error) {
    console.error('Error in postBlogSummary:', error);
    throw error;
  }
}
