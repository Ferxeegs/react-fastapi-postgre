import type { ChangeEvent } from "react";

/** Hanya digit; kosong diperbolehkan. `null` = abaikan perubahan (karakter tidak valid). */
export function parseDigitsOnlyDraft(e: ChangeEvent<HTMLInputElement>): string | null {
  const raw = e.target.value.replace(/\s/g, "").replace(/,/g, "");
  if (raw === "") return "";
  if (!/^\d*$/.test(raw)) return null;
  return raw;
}

/** Angka desimal sederhana (koma dipetakan ke titik). */
export function parseDecimalDraft(e: ChangeEvent<HTMLInputElement>): string | null {
  let raw = e.target.value.replace(/\s/g, "").replace(/,/g, ".");
  if (raw === "") return "";
  if (raw === ".") return "0.";
  if (!/^\d*\.?\d*$/.test(raw)) return null;
  return raw;
}

export function blurNormalizeIntDraft(draft: string): string {
  const t = draft.trim();
  if (t === "") return "";
  const n = Number(t);
  return Number.isFinite(n) ? String(Math.trunc(n)) : draft;
}

export function blurNormalizeDecimalDraft(draft: string): string {
  const t = draft.trim();
  if (t === "") return "";
  const n = Number(t);
  return Number.isFinite(n) ? String(n) : draft;
}

export function parseDraftToNumber(draft: string): number | null {
  const t = draft.trim().replace(/,/g, ".");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
