import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/feed/post-card";
import { BreedFilter } from "@/components/feed/breed-filter";

type SearchParams = Promise<{ breed?: string }>;

export default async function FeedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { breed } = await searchParams;
  const supabase = await createSupabaseServerClient();

  // Build the query: posts joined with author, puppy → breed, and comment count
  let query = supabase
    .from("posts")
    .select(
      `
      id,
      photo_url,
      caption,
      created_at,
      author:users!posts_author_id_fkey ( id, username, avatar_url ),
      puppy:puppies!posts_puppy_id_fkey ( id, name, breed:breeds!puppies_breed_id_fkey ( id, name ) ),
      comments ( count )
    `
    )
    .order("created_at", { ascending: false })
    .limit(30);

  if (breed) {
    query = query.eq("puppy.breed.name", breed);
  }

  const { data: posts } = await query;

  // Fetch breeds for filter dropdown
  const { data: breeds } = await supabase
    .from("breeds")
    .select("id, name")
    .order("name");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feed</h1>
        <BreedFilter breeds={breeds ?? []} current={breed} />
      </div>

      {!posts || posts.length === 0 ? (
        <p className="text-center text-gray-500">
          No posts yet. Be the first to share your puppy!
        </p>
      ) : (
        <div className="space-y-6">
          {posts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
