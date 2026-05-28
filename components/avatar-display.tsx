import React from "react";

export const AVATAR_PRESETS = {
  indigo: { name: "Indigo Nebula", gradient: "from-indigo-500 to-purple-600", border: "border-indigo-400/30", text: "text-white" },
  emerald: { name: "Emerald Aurora", gradient: "from-emerald-500 to-teal-600", border: "border-emerald-400/30", text: "text-white" },
  amber: { name: "Amber Flare", gradient: "from-amber-500 to-orange-600", border: "border-amber-400/30", text: "text-white" },
  rose: { name: "Rose Supernova", gradient: "from-rose-500 to-pink-600", border: "border-rose-400/30", text: "text-white" },
  purple: { name: "Holographic Purple", gradient: "from-purple-500 to-fuchsia-600", border: "border-purple-400/30", text: "text-white" },
  cyan: { name: "Cyan Cyber", gradient: "from-cyan-500 to-blue-600", border: "border-cyan-400/30", text: "text-white" },
};

interface AvatarDisplayProps {
  avatarUrl?: string;
  name?: string;
  className?: string;
}

export default function AvatarDisplay({ avatarUrl, name, className = "h-8 w-8 text-xs" }: AvatarDisplayProps) {
  const initial = name ? name.trim().charAt(0).toUpperCase() : "S";

  if (avatarUrl && (avatarUrl.startsWith("http") || avatarUrl.startsWith("/") || avatarUrl.startsWith("data:"))) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name || "User Avatar"}
        className={`${className} rounded-full object-cover border border-white/10 shadow-sm`}
      />
    );
  }

  // Parse preset
  let presetKey: keyof typeof AVATAR_PRESETS = "purple";
  if (avatarUrl && avatarUrl.startsWith("preset:")) {
    const key = avatarUrl.split(":")[1] as keyof typeof AVATAR_PRESETS;
    if (AVATAR_PRESETS[key]) {
      presetKey = key;
    }
  }

  const preset = AVATAR_PRESETS[presetKey];

  return (
    <div
      className={`${className} rounded-full bg-gradient-to-tr ${preset.gradient} border ${preset.border} ${preset.text} flex items-center justify-center font-bold tracking-wider select-none shadow-sm transition-transform hover:scale-105 duration-200`}
    >
      <span>{initial}</span>
    </div>
  );
}
