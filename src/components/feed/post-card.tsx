import Image from "next/image";
import Link from "next/link";

interface PostCardProps {
  post: {
    id: string;
    photo_url: string;
    caption: string | null;
    created_at: string;
    author: { id: string; username: string; avatar_url: string | null };
    puppy: {
      id: string;
      name: string;
      breed: { id: string; name: string } | null;
    };
    comments: { count: number }[];
  };
}

export function PostCard({ post }: PostCardProps) {
  const commentCount = post.comments?.[0]?.count ?? 0;
  const timeAgo = formatRelative(post.created_at);

  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="h-8 w-8 rounded-full bg-gray-200" />
        <div>
          <Link
            href={`/profile/${post.author.username}`}
            className="text-sm font-semibold hover:underline"
          >
            {post.author.username}
          </Link>
          <p className="text-xs text-gray-500">
            {post.puppy.name}
            {post.puppy.breed && (
              <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">
                {post.puppy.breed.name}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Image */}
      <div className="relative aspect-square w-full bg-gray-100">
        <Image
          src={post.photo_url}
          alt={post.caption ?? "Puppy photo"}
          fill
          className="object-cover"
          sizes="(max-width: 672px) 100vw, 672px"
        />
      </div>

      {/* Caption & meta */}
      <div className="px-4 py-3">
        {post.caption && (
          <p className="mb-1 text-sm">
            <span className="font-semibold">{post.author.username}</span>{" "}
            {post.caption}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <Link href={`/post/${post.id}`} className="hover:underline">
            {commentCount} {commentCount === 1 ? "comment" : "comments"}
          </Link>
          <span>{timeAgo}</span>
        </div>
      </div>
    </article>
  );
}

function formatRelative(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
