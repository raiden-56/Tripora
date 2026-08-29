import { apiRequest } from "./client";

export type PostVisibility = "public" | "private";

export interface Author {
  id: number;
  name: string;
}

export interface Comment {
  id: number;
  body: string;
  createdAt: string;
  author: Author;
}

export interface CommunityPost {
  id: number;
  caption: string | null;
  visibility: PostVisibility;
  createdAt: string;
  author: Author;
  mediaType: "album" | "animation";
  mediaUrl: string | null;
  photoUrls: string[];
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  comments: Comment[];
}

interface BackendComment {
  id: number;
  body: string;
  created_at: string;
  author: Author;
}

interface BackendPost {
  id: number;
  caption: string | null;
  visibility: PostVisibility;
  created_at: string;
  author: Author;
  media_type: "album" | "animation";
  media_url: string | null;
  photo_urls: string[];
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
  comments: BackendComment[];
}

interface Page<T> {
  data: T[];
  meta: { page: number; page_size: number; total: number; total_pages: number };
}

const API_BASE_URL =
  (import.meta as unknown as { env: Record<string, string | undefined> }).env
    .VITE_API_BASE_URL ?? "http://localhost:8000";

function resolveUrl(url: string): string {
  return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
}

function toFrontend(p: BackendPost): CommunityPost {
  return {
    id: p.id,
    caption: p.caption,
    visibility: p.visibility,
    createdAt: p.created_at,
    author: p.author,
    mediaType: p.media_type,
    mediaUrl: p.media_url ? resolveUrl(p.media_url) : null,
    photoUrls: p.photo_urls.map(resolveUrl),
    likeCount: p.like_count,
    commentCount: p.comment_count,
    likedByMe: p.liked_by_me,
    comments: p.comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.created_at,
      author: c.author,
    })),
  };
}

export async function getFeed(): Promise<CommunityPost[]> {
  const result = await apiRequest<Page<BackendPost>>("/api/v1/community/feed?page_size=50");
  return result.data.map(toFrontend);
}

export async function createPost(payload: {
  photoShareId?: number;
  photoAnimationId?: number;
  caption?: string;
  visibility?: PostVisibility;
}): Promise<CommunityPost> {
  const result = await apiRequest<BackendPost>("/api/v1/community/posts", {
    method: "POST",
    body: {
      photo_share_id: payload.photoShareId,
      photo_animation_id: payload.photoAnimationId,
      caption: payload.caption,
      visibility: payload.visibility ?? "public",
    },
  });
  return toFrontend(result);
}

export async function deletePost(id: number): Promise<void> {
  await apiRequest<void>(`/api/v1/community/posts/${id}`, { method: "DELETE" });
}

export async function toggleLike(id: number): Promise<CommunityPost> {
  const result = await apiRequest<BackendPost>(`/api/v1/community/posts/${id}/like`, {
    method: "POST",
  });
  return toFrontend(result);
}

export async function addComment(id: number, body: string): Promise<CommunityPost> {
  const result = await apiRequest<BackendPost>(`/api/v1/community/posts/${id}/comments`, {
    method: "POST",
    body: { body },
  });
  return toFrontend(result);
}

export async function deleteComment(postId: number, commentId: number): Promise<void> {
  await apiRequest<void>(`/api/v1/community/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
  });
}
