"use client";

import { useRouter } from "next/navigation";
import { formatDay } from "@/content/format";
import type { RoadmapVersion } from "@/content/versions";

export function VersionPicker({
  versions,
  current,
}: {
  versions: RoadmapVersion[];
  current?: string;
}) {
  const router = useRouter();
  const latest = versions[versions.length - 1];

  return (
    <label className="version-picker">
      <span>Versão</span>
      <select
        value={current ?? ""}
        onChange={(e) => router.push(e.target.value ? `/?v=${e.target.value}` : "/", { scroll: false })}
      >
        <option value="">Atual{latest ? ` · v${latest.number}` : ""}</option>
        {[...versions].reverse().map((v) => (
          <option key={v.id} value={v.id}>
            v{v.number} · {formatDay(v.at)} · {v.sheetTitle}
            {v.note ? ` — ${v.note}` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
