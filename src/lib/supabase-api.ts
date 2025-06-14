import { BlogPost, supabase } from './supabase';
import { BlogSummary } from '@/components/BlogCarousel';

// Convert Supabase post to blog summaries format
const mapPostToBlogSummary = (post: BlogPost): BlogSummary => {
  return {
    id: post.post_id?.toString() || '',
    title: post.title || '',
    summary: post.summary1 || '', // Default to using summary1
    source: 'JVPolitical AI', // Set a default source
    thumbnail: post.youtube_thumbnail || '',
    youtube_video: post.youtube_video || '',
    youtube_thumbnail: post.youtube_thumbnail || '',
  };
};

/**
 * Fetches post data from Supabase based on post ID.
 * @param postId The WordPress post ID
 * @param signal Optional AbortSignal to cancel the request
 * @returns Array of blog summaries or empty array if none found
 */
export async function fetchPostByPostId(
  postId: number,
  signal?: AbortSignal
): Promise<BlogSummary[]> {
  try {
    // Register early abort check
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    // Create abort handler
    const abortHandler = () => {
      console.log('Supabase fetchPostByPostId request aborted');
      // This will be handled in the catch block
      throw new DOMException('Aborted', 'AbortError');
    };

    // Add abort listener if signal is provided
    signal?.addEventListener('abort', abortHandler, { once: true });

    try {
      // Using fetch options to handle abort signal (Supabase uses fetch internally)
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('post_id', postId)
        .single();

      // Check if aborted during the fetch
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      if (error) {
        console.error('Error fetching post:', error);
        throw new Error('Failed to fetch post');
      }

      if (!data) {
        return [];
      }

      // Convert flat post to BlogSummary array
      // This creates a single item array for compatibility with existing code
      return [mapPostToBlogSummary(data)];
    } finally {
      // Clean up listener to avoid memory leak
      signal?.removeEventListener('abort', abortHandler);
    }
  } catch (error) {
    // Don't log aborted requests as errors
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('Supabase request was aborted');
      return [];
    }
    console.error('Supabase API error:', error);
    throw error;
  }
}

/**
 * Saves post data to Supabase for a specific post ID.
 * @param postId The WordPress post ID
 * @param blogSummary The blog summary to save as post
 * @param signal Optional AbortSignal to cancel the request
 * @returns True if successful, false otherwise
 */
export async function savePost(
  postId: number,
  blogSummary: BlogSummary,
  signal?: AbortSignal
): Promise<boolean> {
  try {
    // Check if already aborted
    if (signal?.aborted) {
      return false;
    }

    // Create abort handler
    const abortHandler = () => {
      console.log('Supabase savePost request aborted');
      throw new DOMException('Aborted', 'AbortError');
    };

    // Add abort listener if signal is provided
    signal?.addEventListener('abort', abortHandler, { once: true });

    try {
      // Convert BlogSummary to flat post structure
      const post: BlogPost = {
        post_id: postId,
        title: blogSummary.title || '',
        summary1: blogSummary.summary || '',
        summary2: blogSummary.summary || '', // Using the same summary for all fields by default
        summary3: blogSummary.summary || '', // Using the same summary for all fields by default
        youtube_video: blogSummary.source || '',
        youtube_thumbnail: blogSummary.thumbnail || '',
        updated_at: new Date().toISOString(),
      };

      // Upsert the post (update if exists, insert if not)
      const { error } = await supabase
        .from('posts')
        .upsert(post, { onConflict: 'post_id' });
      
      // Check if aborted during the request
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      
      if (error) {
        console.error('Error saving post:', error);
        return false;
      }
      
      return true;
    } finally {
      // Clean up listener to avoid memory leak
      signal?.removeEventListener('abort', abortHandler);
    }
  } catch (error) {
    // Don't log aborted requests as errors
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('Supabase save request was aborted');
      return false;
    }
    console.error('Supabase save error:', error);
    throw error;
  }
}
