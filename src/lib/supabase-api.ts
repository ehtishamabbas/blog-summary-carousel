import { BlogPost, supabase } from './supabase';
import { BlogSummary } from '@/components/BlogCarousel';

// Fallback content if data is not available
const fallbackSummaries = [
  "Freedom is on the march! While the radical left pushes their failing agenda, true American patriots are standing strong with President Trump's vision for a strong, prosperous USA. This is what real leadership looks like—putting America First and delivering results, not empty promises!",
  "The America First movement is unstoppable! President Trump's bold policies created the strongest economy in American history before the pandemic, and he'll do it again. Despite the mainstream media's constant attacks, Trump's legacy of tax cuts, deregulation, and strong borders is exactly what this country needs to return to greatness!",
  "Patriots across the nation are rallying around Trump's vision of American excellence! Unlike the current administration's disastrous policies driving inflation and weakness abroad, Trump delivered real prosperity to working families. Make America Great Again isn't just a slogan—it's a commitment to restore pride, strength, and constitutional values!"
];

// Fallback YouTube video content
const fallbackYouTube = {
  youtube_video: 'https://www.youtube.com/watch?v=dGKKIg-ZUkE',
  youtube_thumbnail: '/trump-thumbnail.jpg',
};

/**
 * Convert Supabase post to four specific blog summary cards:
 * 1. Card 1: Displays summary1
 * 2. Card 2: Displays YouTube video
 * 3. Card 3: Displays summary2
 * 4. Card 4: Displays summary3
 */
const createBlogSummaries = (post: BlogPost): BlogSummary[] => {
  const postId = post.post_id?.toString() || '';
  const source = 'JVNN AI';
  
  return [
    // Card 1: Shows summary1 only
    {
      id: `${postId}-s1`,
      summary1: post.summary1 || fallbackSummaries[0], // Use fallback if not available
      summary2: '',
      summary3: '',
      source,
      thumbnail: '', // No image for text cards
      youtube_video: '',
      youtube_thumbnail: post.youtube_thumbnail || fallbackYouTube.youtube_thumbnail
    },
    
    // Card 2: Shows YouTube video
    {
      id: `${postId}-yt`,
      summary1: '',
      summary2: '',
      summary3: '',
      source,
      thumbnail: '',
      youtube_video: post.youtube_video || fallbackYouTube.youtube_video,
      youtube_thumbnail: post.youtube_thumbnail || fallbackYouTube.youtube_thumbnail
    },
    
    // Card 3: Shows summary2 only
    {
      id: `${postId}-s2`,
      summary1: '',
      summary2: post.summary2 || fallbackSummaries[1], // Use fallback if not available
      summary3: '',
      source,
      thumbnail: '', // No image for text cards
      youtube_video: '',
      youtube_thumbnail: post.youtube_thumbnail || fallbackYouTube.youtube_thumbnail
    },
    
    // Card 4: Shows summary3 only
    {
      id: `${postId}-s3`,
      summary1: '',
      summary2: '',
      summary3: post.summary3 || fallbackSummaries[2], // Use fallback if not available
      source,
      thumbnail: '', // No image for text cards
      youtube_video: '',
      youtube_thumbnail: post.youtube_thumbnail || fallbackYouTube.youtube_thumbnail,
      related_posts: post.related_posts || [] // Ensure related_posts are passed for the 4th card
    }
  ];
};

// Legacy mapper function - kept for compatibility with other parts of the codebase
// const mapPostToBlogSummary = (post: BlogPost): BlogSummary => {
//   return {
//     id: post.post_id?.toString() || '',
//     summary: post.summary1 || '', // Default to using summary1
//     source: 'JVNN AI', // Set a default source
//     thumbnail: post.youtube_thumbnail || '',
//     youtube_video: post.youtube_video || '',
//     youtube_thumbnail: post.youtube_thumbnail || '',
//   };
// };

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

      // Convert post data into multiple blog summaries (one for each summary field)
      // This gives us three separate carousel items from a single post
      return createBlogSummaries(data);
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
        summary1: blogSummary.summary1 || '',
        summary2: blogSummary.summary2 || '', // Using the correct summary fields
        summary3: blogSummary.summary3 || '', // Using the correct summary fields
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
