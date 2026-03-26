/** Auto-generated types would go here via `supabase gen types typescript`.
 *  For now, we define the shape manually to match our schema. */

export type Database = {
  public: {
    Tables: {
      breeds: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
      };
      puppies: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          breed_id: string | null;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          breed_id?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          breed_id?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          puppy_id: string;
          photo_url: string;
          caption: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          puppy_id: string;
          photo_url: string;
          caption?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          puppy_id?: string;
          photo_url?: string;
          caption?: string | null;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          body?: string;
          created_at?: string;
        };
      };
      follows: {
        Row: {
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
    };
  };
};
