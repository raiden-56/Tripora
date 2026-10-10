import { useEffect, useRef, useState } from "react";
import {
  Check,
  Clapperboard,
  Copy,
  Images,
  Loader2,
  Share2,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { EmptyState } from "../components/common/EmptyState";
import { useAppStore } from "../store/useAppStore";
import { confirmAction } from "../store/useConfirmStore";
import * as photosApi from "../api/photos.api";
import type { Photo, PhotoShare } from "../api/photos.api";
import * as animationsApi from "../api/photoAnimations.api";
import type { PhotoAnimation } from "../api/photoAnimations.api";
import * as communityApi from "../api/community.api";

const ANIMATION_STATUS_LABEL: Record<PhotoAnimation["status"], string> = {
  pending: "Queued…",
  processing: "Generating…",
  completed: "Ready",
  failed: "Failed",
};

const DEFAULT_ALBUM_TITLE = "My Travel Album";

const errorText = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;

const shareUrl = (share: PhotoShare) =>
  `${window.location.origin}/share/${share.shareToken}`;

/** Keeps memory images in the global store in sync with the photo library. */
const syncMemoryImages = () => {
  void useAppStore.getState().refreshPhotos();
};

export default function Photos() {
  const destinations = useAppStore((s) => s.destinations);
  const pushToast = useAppStore((s) => s.pushToast);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [destinationFilter, setDestinationFilter] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadDestinationId, setUploadDestinationId] = useState("");
  const [animations, setAnimations] = useState<PhotoAnimation[]>([]);
  const [animateModalOpen, setAnimateModalOpen] = useState(false);
  const [animationTitle, setAnimationTitle] = useState("");
  const [creatingAnimation, setCreatingAnimation] = useState(false);
  const [shareTarget, setShareTarget] = useState<PhotoAnimation | null>(null);
  const [shareCaption, setShareCaption] = useState("");
  const [sharingToCommunity, setSharingToCommunity] = useState(false);

  // Share-album flow: name the album -> link created -> optionally post it.
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [albumTitle, setAlbumTitle] = useState(DEFAULT_ALBUM_TITLE);
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  const [createdAlbum, setCreatedAlbum] = useState<PhotoShare | null>(null);
  const [albumCaption, setAlbumCaption] = useState("");
  const [postingAlbum, setPostingAlbum] = useState(false);

  const load = async (destId?: string) => {
    setLoading(true);
    try {
      const result = await photosApi.listPhotos(
        destId ? { destinationId: destId } : {},
      );
      setPhotos(result);
    } catch {
      pushToast("Could not load photos.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    animationsApi.listAnimations().then(setAnimations).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const hasPending = animations.some(
      (a) => a.status === "pending" || a.status === "processing",
    );
    if (!hasPending) return;
    const interval = setInterval(() => {
      animationsApi.listAnimations().then(setAnimations).catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [animations]);

  const onFilterChange = (destId: string) => {
    setDestinationFilter(destId);
    load(destId || undefined);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setUploading(true);
    let uploaded = 0;
    const failures: string[] = [];
    try {
      for (const file of list) {
        try {
          const photo = await photosApi.uploadPhoto(file, {
            destinationId: uploadDestinationId || undefined,
          });
          uploaded += 1;
          // Only show it here if it belongs to the current filter.
          if (!destinationFilter || photo.destinationId === destinationFilter) {
            setPhotos((prev) => [photo, ...prev]);
          }
        } catch (err) {
          failures.push(
            list.length > 1
              ? `${file.name}: ${errorText(err, "upload failed.")}`
              : errorText(err, "Upload failed."),
          );
        }
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    for (const message of failures) pushToast(message, "error");
    if (uploaded > 0) {
      pushToast(
        uploaded === 1 ? "Photo uploaded" : `${uploaded} photos uploaded`,
        "success",
      );
      syncMemoryImages();
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /** Deletes the given photos, returning how many were actually removed. */
  const removePhotos = async (ids: number[]) => {
    setDeleting(true);
    const results = await Promise.allSettled(
      ids.map((id) => photosApi.deletePhoto(id)),
    );
    setDeleting(false);
    const deleted = new Set(
      ids.filter((_, i) => results[i].status === "fulfilled"),
    );
    const failed = ids.length - deleted.size;
    if (deleted.size > 0) {
      setPhotos((prev) => prev.filter((p) => !deleted.has(p.id)));
      setSelected((prev) => new Set([...prev].filter((id) => !deleted.has(id))));
      pushToast(
        deleted.size === 1 ? "Photo deleted" : `${deleted.size} photos deleted`,
        "success",
      );
      syncMemoryImages();
    }
    if (failed > 0) {
      const firstError = results.find((r) => r.status === "rejected");
      pushToast(
        failed === 1
          ? errorText(
              firstError?.status === "rejected" ? firstError.reason : null,
              "Could not delete a photo.",
            )
          : `Could not delete ${failed} photos.`,
        "error",
      );
    }
  };

  const deleteSelected = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const ok = await confirmAction({
      title:
        ids.length === 1 ? "Delete this photo?" : `Delete ${ids.length} photos?`,
      message:
        "They will be removed from your library and any memories they're attached to. This can't be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (ok) await removePhotos(ids);
  };

  const deleteOne = async (photo: Photo) => {
    const ok = await confirmAction({
      title: "Delete this photo?",
      message:
        "It will be removed from your library and any memory it's attached to. This can't be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (ok) await removePhotos([photo.id]);
  };

  const openShareAlbum = () => {
    if (selected.size === 0) {
      pushToast("Select photos to share first.", "error");
      return;
    }
    setAlbumTitle(DEFAULT_ALBUM_TITLE);
    setCreatedAlbum(null);
    setAlbumCaption("");
    setAlbumModalOpen(true);
  };

  const closeShareAlbum = () => {
    setAlbumModalOpen(false);
    setCreatedAlbum(null);
  };

  const copyAlbumLink = async (share: PhotoShare) => {
    try {
      await navigator.clipboard.writeText(shareUrl(share));
      pushToast("Share link copied to clipboard", "success");
    } catch {
      pushToast("Couldn't copy automatically — copy the link above.", "info");
    }
  };

  const createAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = albumTitle.trim();
    if (!title) {
      pushToast("Give your album a name.", "error");
      return;
    }
    setCreatingAlbum(true);
    try {
      const share = await photosApi.sharePhotos({
        title,
        photoIds: Array.from(selected),
      });
      setCreatedAlbum(share);
      setSelected(new Set());
      try {
        await navigator.clipboard.writeText(shareUrl(share));
        pushToast("Album created — share link copied", "success");
      } catch {
        pushToast("Album created", "success");
      }
    } catch (err) {
      pushToast(errorText(err, "Could not create share link."), "error");
    } finally {
      setCreatingAlbum(false);
    }
  };

  const postAlbumToCommunity = async () => {
    if (!createdAlbum) return;
    setPostingAlbum(true);
    try {
      await communityApi.createPost({
        photoShareId: createdAlbum.id,
        caption: albumCaption.trim() || undefined,
        visibility: "public",
      });
      pushToast("Album posted to the community feed.", "success");
      closeShareAlbum();
    } catch (err) {
      pushToast(errorText(err, "Could not post to community."), "error");
    } finally {
      setPostingAlbum(false);
    }
  };

  const createAnimation = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAnimation(true);
    try {
      const animation = await animationsApi.createAnimation(
        animationTitle.trim() || "Untitled Animation",
        Array.from(selected),
      );
      setAnimations((prev) => [animation, ...prev]);
      setAnimateModalOpen(false);
      setAnimationTitle("");
      setSelected(new Set());
      pushToast("Animation queued — it'll appear below shortly.", "success");
    } catch (err) {
      pushToast(errorText(err, "Could not start animation."), "error");
    } finally {
      setCreatingAnimation(false);
    }
  };

  const removeAnimation = async (animation: PhotoAnimation) => {
    const ok = await confirmAction({
      title: "Delete this animation?",
      message: `"${animation.title}" will be permanently deleted.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await animationsApi.deleteAnimation(animation.id);
      setAnimations((prev) => prev.filter((a) => a.id !== animation.id));
      pushToast("Animation deleted", "success");
    } catch (err) {
      pushToast(errorText(err, "Could not delete animation."), "error");
    }
  };

  const shareToCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareTarget) return;
    setSharingToCommunity(true);
    try {
      await communityApi.createPost({
        photoAnimationId: shareTarget.id,
        caption: shareCaption.trim() || undefined,
        visibility: "public",
      });
      pushToast("Shared to the community feed.", "success");
      setShareTarget(null);
      setShareCaption("");
    } catch (err) {
      pushToast(errorText(err, "Could not share to community."), "error");
    } finally {
      setSharingToCommunity(false);
    }
  };

  return (
    <div>
      <TopBar
        title="Photo Hub"
        subtitle="All your travel photos in one place"
      />
      <div className="px-5 md:px-8 pb-10">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <select
            value={destinationFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-3.5 py-2.5 rounded-full border border-ink/12 dark:border-white/15 bg-white dark:bg-white/5 text-sm outline-none focus:border-forest-400"
          >
            <option value="">All destinations</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={uploadDestinationId}
            onChange={(e) => setUploadDestinationId(e.target.value)}
            className="px-3.5 py-2.5 rounded-full border border-ink/12 dark:border-white/15 bg-white dark:bg-white/5 text-sm outline-none focus:border-forest-400"
          >
            <option value="">Upload to: unassigned</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                Upload to: {d.name}
              </option>
            ))}
          </select>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Upload size={15} />
            )}
            Upload Photos
          </button>

          {selected.size > 0 && (
            <>
              <button
                onClick={openShareAlbum}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-ink/15 dark:border-white/20 text-sm font-semibold"
              >
                <Share2 size={15} /> Share ({selected.size})
              </button>
              {selected.size >= 2 && (
                <button
                  onClick={() => setAnimateModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-sky-400 text-sky-600 text-sm font-semibold"
                >
                  <Clapperboard size={15} /> Animate ({selected.size})
                </button>
              )}
              <button
                onClick={deleteSelected}
                disabled={deleting}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-coral-300 text-coral-600 text-sm font-semibold disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Trash2 size={15} />
                )}
                Delete
              </button>
            </>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-forest-500" size={24} />
          </div>
        ) : photos.length === 0 ? (
          <EmptyState
            icon={<Images size={26} />}
            title="No photos yet"
            description="Upload photos from any device to build your travel photo album."
            actionLabel="Upload Photos"
            onAction={() => fileInputRef.current?.click()}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((p) => (
              <div
                key={p.id}
                className={`relative group rounded-2xl overflow-hidden aspect-square border-2 transition ${
                  selected.has(p.id)
                    ? "border-forest-500"
                    : "border-transparent"
                }`}
              >
                <button
                  onClick={() => toggleSelect(p.id)}
                  aria-pressed={selected.has(p.id)}
                  aria-label={selected.has(p.id) ? "Deselect photo" : "Select photo"}
                  className="block w-full h-full"
                >
                  <img
                    src={p.url}
                    alt={p.caption ?? "Travel photo"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {selected.has(p.id) && (
                    <div className="absolute inset-0 bg-forest-500/20 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-forest-500 text-white flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    </div>
                  )}
                </button>
                <button
                  onClick={() => deleteOne(p)}
                  disabled={deleting}
                  aria-label="Delete photo"
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-coral-500 transition md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-60"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {animations.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-xl flex items-center gap-2 mb-4">
              <Clapperboard size={18} className="text-sky-500" /> My Animations
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {animations.map((a) => (
                <div
                  key={a.id}
                  className="relative rounded-2xl overflow-hidden aspect-square bg-ink/5 dark:bg-white/5 border border-ink/8 dark:border-white/10 group"
                >
                  {a.status === "completed" && a.outputUrl ? (
                    <img
                      src={a.outputUrl}
                      alt={a.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-ink-soft dark:text-white/40">
                      {a.status === "failed" ? (
                        <X size={20} className="text-coral-500" />
                      ) : (
                        <Loader2 size={20} className="animate-spin" />
                      )}
                      <span className="text-xs">{ANIMATION_STATUS_LABEL[a.status]}</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between gap-1">
                    <span className="text-white text-xs font-medium truncate">
                      {a.title}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {a.status === "completed" && (
                        <button
                          onClick={() => setShareTarget(a)}
                          className="text-white/70 hover:text-sky-400"
                          aria-label="Share to community"
                        >
                          <Users size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => removeAnimation(a)}
                        className="text-white/70 hover:text-coral-400"
                        aria-label="Delete animation"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {albumModalOpen && (
        <div
          className="fixed inset-0 z-[1100] bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeShareAlbum}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-[#1c2024] rounded-2xl shadow-soft-lg p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg flex items-center gap-2">
                <Share2 size={17} className="text-forest-500" />
                {createdAlbum ? "Album Ready" : "Share Album"}
              </h3>
              <button onClick={closeShareAlbum} aria-label="Close">
                <X size={18} className="text-ink-soft" />
              </button>
            </div>

            {!createdAlbum ? (
              <>
                <p className="text-xs text-ink-soft dark:text-white/50 mb-3">
                  Creates a public link for the {selected.size} selected photo
                  {selected.size === 1 ? "" : "s"}.
                </p>
                <form onSubmit={createAlbum} className="flex flex-col gap-3">
                  <label className="block">
                    <span className="text-xs font-semibold text-ink-soft dark:text-white/60 mb-1.5 block">
                      Album name
                    </span>
                    <input
                      autoFocus
                      value={albumTitle}
                      onChange={(e) => setAlbumTitle(e.target.value)}
                      maxLength={150}
                      placeholder="e.g. Coorg Weekend"
                      className="w-full px-3 py-2 rounded-lg border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={creatingAlbum || !albumTitle.trim()}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition disabled:opacity-60"
                  >
                    {creatingAlbum ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Share2 size={15} />
                    )}
                    Create Share Link
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  <Check size={15} className="text-forest-500" />
                  {createdAlbum.title}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={shareUrl(createdAlbum)}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-ink/12 dark:border-white/15 bg-ink/5 dark:bg-white/5 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyAlbumLink(createdAlbum)}
                    className="w-9 h-9 rounded-full border border-ink/15 dark:border-white/20 flex items-center justify-center shrink-0 hover:bg-ink/5 dark:hover:bg-white/5"
                    aria-label="Copy share link"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                <div className="border-t border-ink/8 dark:border-white/10 pt-3 flex flex-col gap-3">
                  <textarea
                    value={albumCaption}
                    onChange={(e) => setAlbumCaption(e.target.value)}
                    placeholder="Add a caption for the community (optional)…"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400 resize-none"
                  />
                  <button
                    type="button"
                    onClick={postAlbumToCommunity}
                    disabled={postingAlbum}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition disabled:opacity-60"
                  >
                    {postingAlbum ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Users size={15} />
                    )}
                    Post to Community
                  </button>
                  <button
                    type="button"
                    onClick={closeShareAlbum}
                    className="py-2.5 rounded-full border border-ink/15 dark:border-white/20 text-sm font-semibold hover:bg-ink/5 dark:hover:bg-white/5"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {animateModalOpen && (
        <div
          className="fixed inset-0 z-[1100] bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setAnimateModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-[#1c2024] rounded-2xl shadow-soft-lg p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg flex items-center gap-2">
                <Clapperboard size={17} className="text-sky-500" /> Create Animation
              </h3>
              <button onClick={() => setAnimateModalOpen(false)} aria-label="Close">
                <X size={18} className="text-ink-soft" />
              </button>
            </div>
            <p className="text-xs text-ink-soft dark:text-white/50 mb-3">
              Turns {selected.size} selected photos into a looping GIF you can share to
              the community.
            </p>
            <form onSubmit={createAnimation} className="flex flex-col gap-3">
              <input
                autoFocus
                value={animationTitle}
                onChange={(e) => setAnimationTitle(e.target.value)}
                placeholder="e.g. Coorg Weekend Highlights"
                className="w-full px-3 py-2 rounded-lg border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                disabled={creatingAnimation}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition disabled:opacity-60"
              >
                {creatingAnimation ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Clapperboard size={15} />
                )}
                Generate Animation
              </button>
            </form>
          </div>
        </div>
      )}

      {shareTarget && (
        <div
          className="fixed inset-0 z-[1100] bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShareTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-[#1c2024] rounded-2xl shadow-soft-lg p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg flex items-center gap-2">
                <Users size={17} className="text-sky-500" /> Share to Community
              </h3>
              <button onClick={() => setShareTarget(null)} aria-label="Close">
                <X size={18} className="text-ink-soft" />
              </button>
            </div>
            <img
              src={shareTarget.outputUrl ?? undefined}
              alt={shareTarget.title}
              className="w-full aspect-video object-cover rounded-xl mb-3"
            />
            <form onSubmit={shareToCommunity} className="flex flex-col gap-3">
              <textarea
                autoFocus
                value={shareCaption}
                onChange={(e) => setShareCaption(e.target.value)}
                placeholder="Add a caption…"
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-sky-400 resize-none"
              />
              <button
                type="submit"
                disabled={sharingToCommunity}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition disabled:opacity-60"
              >
                {sharingToCommunity ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Users size={15} />
                )}
                Post to Community
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
