import { NextRequest, NextResponse } from 'next/server';
import { BlogPost, supabase } from '@/lib/supabase';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

// Type for the incoming webhook data from n8n
interface WebhookData {
  post_id: number;
  post?: {
    post_title?: string;
    post_content?: string;
    post_excerpt?: string;
    post_meta?: {
      url?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  post_meta?: Record<string, unknown>;
  post_thumbnail?: string;
  post_permalink?: string;
  taxonomies?: Record<string, unknown>;
  // Any additional fields from WordPress
  [key: string]: unknown;
}

// Process the incoming data and save to Supabase
async function processPostData(data: WebhookData) {
  try {
    if (!data.post_id) {
      throw new Error('Missing post_id in webhook data');
    }

    // Example: Extract information from the post data
    // This would be customized based on your WordPress structure
    const postId = data.post_id;
    const title = data.post?.post_title || 'Untitled Post';
    // Removed unused content and thumbnail variables
    const description = data.post?.post_excerpt || '';
    const url = data.post?.post_meta?.url || '';

    // Check if post already exists
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id')
      .eq('post_id', postId)
      .single();

    if (existingPost) {
      console.log(`Found existing post ${postId}`);
      // You could decide to update or delete & recreate them
      // For now, we'll just return and not create duplicates
      return {
        success: true,
        message: `Found existing post ${postId}`,
        post: existingPost
      };
    }

    // Create or update a post record
    const postData: BlogPost = {
      post_id: postId,
      title: title || `Post ${postId}`,
      summary: description || 'No description provided',
      youtube_video: '',  // You can set these based on your incoming data
      youtube_thumbnail: url || 'https://via.placeholder.com/800x600',
      updated_at: new Date().toISOString()
    };

    // Insert the post into Supabase
    const { error: insertError } = await supabase
      .from('posts')
      .upsert(postData, { onConflict: 'post_id' });

    if (insertError) {
      throw insertError;
    }

    // The post is already inserted above, no need for additional carousel items

    return {
      success: true,
      message: 'Post created successfully',
      post: postData,
    };
  } catch (error) {
    console.error('Error processing webhook data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Main API route handler
export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as WebhookData;
    console.log('Received webhook data:', JSON.stringify(data).substring(0, 200) + '...');
    
    const result = await processPostData(data);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// For testing the endpoint - returns a 200 OK response
export async function GET() {
  return NextResponse.json({ success: true, message: 'Webhook endpoint is active' });
}
