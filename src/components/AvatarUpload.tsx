"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  username: string;
  avatarUrl: string | null;
};

export default function AvatarUpload({ userId, username, avatarUrl }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED.includes(file.type)) {
      setError("Only JPG, PNG, or WebP images are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2 MB");
      return;
    }

    setLoading(true);
    setError(null);

    // Show preview immediately
    setPreview(URL.createObjectURL(file));

    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setLoading(false);
      return;
    }

    // Get public URL
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`; // cache bust

    // Save to profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setPreview(publicUrl);
      router.refresh();
    }

    setLoading(false);
  }

  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar circle */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="relative group"
        title="Change profile picture"
      >
        <div
          className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shrink-0"
          style={{
            background: preview ? "transparent" : "var(--gold-glow)",
            border: "2px solid var(--gold-border)",
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt={username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              className="font-mono font-bold text-2xl"
              style={{ color: "var(--gold)" }}
            >
              {initials}
            </span>
          )}
        </div>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          {loading ? (
            <span className="font-mono text-[10px] text-white">...</span>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFile}
      />

      <p className="font-mono text-[10px] tracking-wider" style={{ color: "var(--text-3)" }}>
        {loading ? "Uploading..." : "Click to change photo"}
      </p>

      {error && (
        <p className="text-xs text-center" style={{ color: "var(--loss)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
