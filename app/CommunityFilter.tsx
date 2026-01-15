"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const DEFAULT_COMMUNITIES = ["The Skyline Collection", "Three Hills"];

export default function CommunityFilter(props: {
  communities: string[];
  selected: string[];
}) {
  const { communities, selected } = props;

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // If URL provides a selection, use it; otherwise default to the two communities
  const hasUrlSelection = (selected?.length ?? 0) > 0;
  const [value, setValue] = useState<string[]>(
    hasUrlSelection ? selected : DEFAULT_COMMUNITIES
  );

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedSet = useMemo(() => new Set(value), [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return communities;
    return communities.filter((c) => c.toLowerCase().includes(q));
  }, [communities, query]);

  function apply(nextSelected: string[]) {
    const params = new URLSearchParams(sp.toString());

    if (nextSelected.length === 0) {
      params.delete("community");
    } else {
      params.set("community", nextSelected.join(","));
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleCommunity(name: string) {
    const next = selectedSet.has(name)
      ? value.filter((v) => v !== name)
      : [...value, name].sort((a, b) => a.localeCompare(b));

    setValue(next);
    apply(next);
  }

  function clearAll() {
    setValue([]);
    apply([]);
  }

  // Keep local state in sync with URL selection if it exists
  useEffect(() => {
    if (selected && selected.length > 0) {
      setValue(selected);
    }
    // If user cleared URL param entirely (selected becomes []), we DO NOT
    // force defaults back in—so Clear truly clears.
  }, [selected]);

  // On first mount, if URL has no community param, write defaults once
  useEffect(() => {
    if (!sp.get("community")) {
      apply(DEFAULT_COMMUNITIES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // click-outside to close
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node | null;
      if (!t) return;
      if (dropdownRef.current && !dropdownRef.current.contains(t)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // ESC to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const buttonLabel =
    value.length === 0 ? "Communities (All)" : `Communities (${value.length})`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="border rounded px-3 py-1.5 text-sm hover:bg-gray-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {buttonLabel}
      </button>

      {/* Selected chips */}
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 max-w-[520px]">
          {value.slice(0, 6).map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 border rounded-full px-2 py-0.5 text-xs bg-white"
              title={c}
            >
              <span className="truncate max-w-[220px]">{c}</span>
              <button
                type="button"
                onClick={() => toggleCommunity(c)}
                className="text-gray-500 hover:text-gray-800"
                aria-label={`Remove ${c}`}
              >
                ×
              </button>
            </span>
          ))}
          {value.length > 6 && (
            <span className="text-xs text-gray-500 self-center">
              +{value.length - 6} more
            </span>
          )}
        </div>
      )}

      {open && (
        <div className="absolute z-50 mt-2 w-[420px] max-w-[90vw] rounded border bg-white shadow-lg">
          <div className="p-3 border-b">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search communities…"
              className="w-full border rounded px-2 py-1 text-sm"
              autoFocus
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {filtered.length} shown • {value.length} selected
              </div>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs border rounded px-2 py-1 hover:bg-gray-50 disabled:opacity-50"
                disabled={value.length === 0}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-[320px] overflow-auto p-2">
            {filtered.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">No matches.</div>
            ) : (
              <ul className="space-y-1">
                {filtered.map((c) => {
                  const checked = selectedSet.has(c);
                  return (
                    <li key={c}>
                      <label className="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCommunity(c)}
                          className="mt-0.5"
                        />
                        <span className="text-sm leading-5">{c}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="p-2 border-t flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="border rounded px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
