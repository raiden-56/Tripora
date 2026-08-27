import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Logo } from "../components/common/Logo";
import { apiRequest } from "../api/client";

interface SharedPhoto {
  id: number;
  url: string;
  caption: string | null;
}

interface PublicShare {
  title: string;
  description: string | null;
  photos: SharedPhoto[];
}

const API_BASE_URL =
  (import.meta as unknown as { env: Record<string, string | undefined> }).env
    .VITE_API_BASE_URL ?? "http://localhost:8000";

export default function PublicPhotoShare() {
  const { token } = useParams();
  const [share, setShare] = useState<PublicShare | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiRequest<{
      title: string;
      description: string | null;
      photos: { id: number; url: string; caption: string | null }[];
    }>(`/api/v1/share/${token}`, { auth: false })
      .then((res) =>
        setShare({
          title: res.title,
          description: res.description,
          photos: res.photos.map((p) => ({
            ...p,
            url: p.url.startsWith("http") ? p.url : `${API_BASE_URL}${p.url}`,
          })),
        }),
      )
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-paper dark:bg-[#14171a]">
      <header className="flex items-center justify-between px-6 md:px-10 py-5 max-w-5xl mx-auto">
        <Logo />
        <span className="text-xs text-ink-soft dark:text-white/50">
          Shared Album
        </span>
      </header>
      <div className="max-w-5xl mx-auto px-6 md:px-10 pb-16">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-forest-500" size={24} />
          </div>
        ) : error || !share ? (
          <p className="text-center text-ink-soft dark:text-white/50 py-24">
            This shared album does not exist or is no longer available.
          </p>
        ) : (
          <>
            <h1 className="font-display text-3xl mb-2">{share.title}</h1>
            {share.description && (
              <p className="text-ink-soft dark:text-white/50 mb-8">
                {share.description}
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {share.photos.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl overflow-hidden aspect-square"
                >
                  <img
                    src={p.url}
                    alt={p.caption ?? "Shared photo"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
