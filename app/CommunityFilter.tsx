"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function CommunityFilter({ communities }: { communities: string[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const current = sp.get("community") ?? "";

  function onChange(next: string) {
    const params = new URLSearchParams(sp.toString());
    if (!next) params.delete("community");
    else params.set("community", next);

    const qs = params.toString();
    router.push(qs ? `/?${qs}` : `/`);
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-700">Community</label>
      <select
        className="border rounded px-2 py-1 text-sm"
        value={current}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All</option>
        {communities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
