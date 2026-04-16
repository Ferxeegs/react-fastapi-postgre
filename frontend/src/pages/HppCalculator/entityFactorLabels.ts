import type { TenantCategory } from "./calculatorTypes";

/** Label singkat kategori untuk teks opsi FP1, selaras dengan contoh UI. */
export function formatEntityCategoryLabel(cat: string): string {
  const c = (cat || "").toLowerCase();
  if (c.includes("sosial")) return "Sosial";
  if (c.includes("non")) return "Non Bisnis";
  return "Bisnis";
}

export function categoryStringToTenantCategory(cat: string): TenantCategory {
  const c = (cat || "").toLowerCase();
  if (c.includes("sosial")) return "sosial";
  if (c.includes("non")) return "non-bisnis";
  return "bisnis";
}

export function formatEntityFactorOptionLabel(entityType: string, category: string, percentage: number): string {
  return `${entityType} (${formatEntityCategoryLabel(category)} – ${percentage}%)`;
}
