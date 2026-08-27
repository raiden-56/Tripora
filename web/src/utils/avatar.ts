/** Returns a real avatar URL, or a deterministic initials-based placeholder when the user has none set. */
export function resolveAvatarUrl(
  avatarUrl: string | undefined,
  name: string | undefined,
): string {
  if (avatarUrl) return avatarUrl;
  const seed = encodeURIComponent(name?.trim() || "Traveler");
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundType=gradientLinear`;
}
