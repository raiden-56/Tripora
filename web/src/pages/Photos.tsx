import { useEffect, useRef, useState } from "react";
import { Images, Loader2, Share2, Trash2, Upload } from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { EmptyState } from "../components/common/EmptyState";
import { useAppStore } from "../store/useAppStore";
import * as photosApi from "../api/photos.api";
import type { Photo } from "../api/photos.api";

export default function Photos() {
  const destinations = useAppStore((s) => s.destinations);
  const pushToast = useAppStore((s) => s.pushToast);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [destinationFilter, setDestinationFilter] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadDestinationId, setUploadDestinationId] = useState("");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilterChange = (destId: string) => {
    setDestinationFilter(destId);
    load(destId || undefined);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const photo = await photosApi.uploadPhoto(file, {
          destinationId: uploadDestinationId || undefined,
        });
        setPhotos((prev) => [photo, ...prev]);
      }
      pushToast("Photos uploaded", "success");
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Upload failed.", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  const deleteSelected = async () => {
    const ids = Array.from(selected);
    for (const id of ids) {
      try {
        await photosApi.deletePhoto(id);
        setPhotos((prev) => prev.filter((p) => p.id !== id));
      } catch {
        pushToast("Could not delete a photo.", "error");
      }
    }
    setSelected(new Set());
  };

  const shareAlbum = async () => {
    if (selected.size === 0) {
      pushToast("Select photos to share first.", "error");
      return;
    }
    try {
      const result = await photosApi.sharePhotos({
        title: "My Travel Diaries Album",
        photoIds: Array.from(selected),
      });
      const url = `${window.location.origin}/share/${result.shareToken}`;
      await navigator.clipboard.writeText(url).catch(() => {});
      pushToast("Share link copied to clipboard", "success");
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : "Could not create share link.",
        "error",
      );
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
                onClick={shareAlbum}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-ink/15 dark:border-white/20 text-sm font-semibold"
              >
                <Share2 size={15} /> Share ({selected.size})
              </button>
              <button
                onClick={deleteSelected}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-coral-300 text-coral-600 text-sm font-semibold"
              >
                <Trash2 size={15} /> Delete
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
              <button
                key={p.id}
                onClick={() => toggleSelect(p.id)}
                className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition ${
                  selected.has(p.id)
                    ? "border-forest-500"
                    : "border-transparent"
                }`}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
