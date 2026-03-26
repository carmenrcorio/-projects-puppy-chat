"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface BreedFilterProps {
  breeds: { id: string; name: string }[];
  current?: string;
}

export function BreedFilter({ breeds, current }: BreedFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("breed", e.target.value);
    } else {
      params.delete("breed");
    }
    router.push(`/feed?${params.toString()}`);
  }

  return (
    <select
      value={current ?? ""}
      onChange={handleChange}
      className="rounded border border-gray-300 px-3 py-1.5 text-sm"
    >
      <option value="">All breeds</option>
      {breeds.map((b) => (
        <option key={b.id} value={b.name}>
          {b.name}
        </option>
      ))}
    </select>
  );
}
