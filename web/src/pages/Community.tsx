import { useEffect, useState } from "react";
import { Heart, Loader2, MessageCircle, Send, Trash2, Users } from "lucide-react";
import clsx from "clsx";
import { TopBar } from "../components/layout/TopBar";
import { EmptyState } from "../components/common/EmptyState";
import { useAppStore } from "../store/useAppStore";
import * as communityApi from "../api/community.api";
import type { CommunityPost } from "../api/community.api";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Community() {
  const currentUserId = useAppStore((s) => s.user.id);
  const pushToast = useAppStore((s) => s.pushToast);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [openComments, setOpenComments] = useState<Set<number>>(new Set());

  const load = async () => {
    setLoading(true);
    try {
      setPosts(await communityApi.getFeed());
    } catch {
      pushToast("Could not load the community feed.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleLike = async (post: CommunityPost) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likeCount + (p.likedByMe ? -1 : 1) }
          : p,
      ),
    );
    try {
      const updated = await communityApi.toggleLike(post.id);
      setPosts((prev) => prev.map((p) => (p.id === post.id ? updated : p)));
    } catch {
      pushToast("Could not update like.", "error");
      load();
    }
  };

  const toggleCommentsOpen = (postId: number) => {
    setOpenComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const submitComment = async (postId: number) => {
    const body = (commentDrafts[postId] ?? "").trim();
    if (!body) return;
    try {
      const updated = await communityApi.addComment(postId, body);
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Could not post comment.", "error");
    }
  };

  const removePost = async (postId: number) => {
    try {
      await communityApi.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      pushToast("Could not delete post.", "error");
    }
  };

  return (
    <div>
      <TopBar
        title="Community"
        subtitle="Trip highlights and memories shared by travelers."
      />
      <div className="px-5 md:px-8 pb-10 max-w-xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-forest-500" size={24} />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<Users size={22} />}
            title="Nothing shared yet"
            description="Create a photo animation from your trips and share it here to kick things off."
          />
        ) : (
          <div className="flex flex-col gap-5">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-3xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-forest-500/15 text-forest-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {post.author.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">{post.author.name}</p>
                      <p className="text-[11px] text-ink-soft dark:text-white/40">
                        {timeAgo(post.createdAt)}
                        {post.visibility === "private" && " · Only visible to you"}
                      </p>
                    </div>
                  </div>
                  {post.author.id === currentUserId && (
                    <button
                      onClick={() => removePost(post.id)}
                      className="text-ink-soft hover:text-coral-500"
                      aria-label="Delete post"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                {post.caption && (
                  <p className="px-4 pb-3 text-sm text-ink-soft dark:text-white/70">
                    {post.caption}
                  </p>
                )}

                {post.mediaType === "animation" && post.mediaUrl ? (
                  <img src={post.mediaUrl} alt="" className="w-full object-cover" />
                ) : (
                  <div
                    className={clsx(
                      "grid gap-0.5",
                      post.photoUrls.length === 1 ? "grid-cols-1" : "grid-cols-2",
                    )}
                  >
                    {post.photoUrls.slice(0, 4).map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className="w-full aspect-square object-cover"
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 px-4 py-3">
                  <button
                    onClick={() => toggleLike(post)}
                    className={clsx(
                      "flex items-center gap-1.5 text-sm font-semibold transition",
                      post.likedByMe ? "text-coral-500" : "text-ink-soft dark:text-white/50",
                    )}
                  >
                    <Heart size={17} fill={post.likedByMe ? "currentColor" : "none"} />
                    {post.likeCount}
                  </button>
                  <button
                    onClick={() => toggleCommentsOpen(post.id)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft dark:text-white/50"
                  >
                    <MessageCircle size={17} /> {post.commentCount}
                  </button>
                </div>

                {openComments.has(post.id) && (
                  <div className="px-4 pb-4 flex flex-col gap-2.5 border-t border-ink/8 dark:border-white/10 pt-3">
                    {post.comments.map((c) => (
                      <div key={c.id} className="text-sm">
                        <span className="font-semibold mr-1.5">{c.author.name}</span>
                        <span className="text-ink-soft dark:text-white/70">{c.body}</span>
                      </div>
                    ))}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        submitComment(post.id);
                      }}
                      className="flex items-center gap-2 mt-1"
                    >
                      <input
                        value={commentDrafts[post.id] ?? ""}
                        onChange={(e) =>
                          setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        placeholder="Add a comment…"
                        className="flex-1 px-3 py-1.5 rounded-full border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400"
                      />
                      <button
                        type="submit"
                        className="w-8 h-8 rounded-full bg-forest-500 text-white flex items-center justify-center shrink-0"
                        aria-label="Post comment"
                      >
                        <Send size={13} />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
