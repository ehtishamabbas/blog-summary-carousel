import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabaseUrl = 'https://ycnsiwjbiqozvipwgwgs.supabase.co';
// Use a hardcoded key for build process - this is the public anon key, not a secret
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbnNpd2piaXFvenZpcHdnd2dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MjQ2OTEsImV4cCI6MjA2NTQwMDY5MX0.A27vvevzo75ntNBe1d7cNGAYznpd-ScYTbfKHMUn7po';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Define types for blog posts
export interface BlogPost {
  id?: number;
  post_id: number;
  created_at?: string;
  updated_at?: string;
  summary1: string;
  summary2: string;
  summary3: string;
  youtube_video: string;
  youtube_thumbnail: string;
}

export type Tables = {
  posts: BlogPost;
};
