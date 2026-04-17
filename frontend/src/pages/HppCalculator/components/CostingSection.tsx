import type {
  CostingResult,
  EntityAdjustmentFactor,
  HppMasterData,
  OverheadItem,
  PaymentType,
  PeriodType,
  TenantCategory,
} from "../calculatorTypes";
import { categoryStringToTenantCategory } from "../entityFactorLabels";
import { CustomSelect, Field, SegmentButton, WizardStepper } from "./SharedUi";

export function CostingSection({
  wizardStep,
  steps,
  error,
  partnerName,
  setPartnerName,
  tenantCategory,
  onTenantCategoryChange,
  setTenantCategory,
  periodType,
  setPeriodType,
  durationYears,
  setDurationYears,
  landArea,
  setLandArea,
  selectedLandValueId,
  setSelectedLandValueId,
  landEntityFactorRows,
  selectedLandEntityFactorId,
  setSelectedLandEntityFactorId,
  selectedLocationFactorId,
  setSelectedLocationFactorId,
  selectedPeriodFactorLabel,
  fp3Pct,
  paymentType,
  setPaymentType,
  terminDisabled,
  selectedPaymentFactorId,
  selectedPaymentFactorLabel,
  fp4Pct,
  selectedLandValue,
  rentalVarLand,
  fp1LandPct,
  fp2Pct,
  previewLandBase,
  buildingArea,
  setBuildingArea,
  selectedBuildingValueId,
  setSelectedBuildingValueId,
  buildingEntityFactorRows,
  selectedBuildingEntityFactorId,
  setSelectedBuildingEntityFactorId,
  selectedBuildingValue,
  rentalVarBuilding,
  fp1BuildingPct,
  previewBuildingBase,
  overheads,
  onChangeOverhead,
  onRemoveOverhead,
  onAddOverhead,
  overheadTotal,
  marginFee,
  costingCore,
  hppLunasLabel,
  canGoNext,
  setError,
  setWizardStep,
  goToPricing,
  master,
  formatCurrency,
}: {
  wizardStep: number;
  steps: readonly { id: number; title: string; subtitle: string }[];
  error: string | null;
  partnerName: string;
  setPartnerName: (v: string) => void;
  tenantCategory: TenantCategory;
  onTenantCategoryChange: (v: TenantCategory) => void;
  setTenantCategory: (v: TenantCategory) => void;
  periodType: PeriodType;
  setPeriodType: (v: PeriodType) => void;
  durationYears: number | "";
  setDurationYears: (v: number | "") => void;
  landArea: number | "";
  setLandArea: (v: number | "") => void;
  selectedLandValueId: number | null;
  setSelectedLandValueId: (v: number) => void;
  landEntityFactorRows: EntityAdjustmentFactor[];
  selectedLandEntityFactorId: number | null;
  setSelectedLandEntityFactorId: (v: number | null) => void;
  selectedLocationFactorId: number | null;
  setSelectedLocationFactorId: (v: number) => void;
  selectedPeriodFactorLabel: string;
  fp3Pct: number;
  paymentType: PaymentType;
  setPaymentType: (v: PaymentType) => void;
  terminDisabled: boolean;
  selectedPaymentFactorId: number | null;
  selectedPaymentFactorLabel: string;
  fp4Pct: number;
  selectedLandValue: HppMasterData["fair_land_values"][number] | undefined;
  rentalVarLand: number;
  fp1LandPct: number;
  fp2Pct: number;
  previewLandBase: number;
  buildingArea: number | "";
  setBuildingArea: (v: number | "") => void;
  selectedBuildingValueId: number | null;
  setSelectedBuildingValueId: (v: number) => void;
  buildingEntityFactorRows: EntityAdjustmentFactor[];
  selectedBuildingEntityFactorId: number | null;
  setSelectedBuildingEntityFactorId: (v: number | null) => void;
  selectedBuildingValue: HppMasterData["fair_building_values"][number] | undefined;
  rentalVarBuilding: number;
  fp1BuildingPct: number;
  previewBuildingBase: number;
  overheads: OverheadItem[];
  onChangeOverhead: (idx: number, key: keyof OverheadItem, value: any) => void;
  onRemoveOverhead: (idx: number) => void;
  onAddOverhead: () => void;
  overheadTotal: number;
  marginFee: number | "";
  costingCore: CostingResult;
  hppLunasLabel: string;
  canGoNext: () => boolean;
  setError: (v: string | null) => void;
  setWizardStep: (v: number | ((prev: number) => number)) => void;
  goToPricing: () => void;
  master: HppMasterData | null;
  formatCurrency: (value: number) => string;
}) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <WizardStepper currentStep={wizardStep} steps={steps} />

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 bg-gray-50/80 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/80">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Analisa biaya · Langkah {wizardStep} dari {steps.length}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xl" aria-hidden>
              {wizardStep === 1 && "🌿"}
              {wizardStep === 2 && "🏢"}
              {wizardStep === 3 && "📋"}
              {wizardStep === 4 && "📊"}
            </span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Step {wizardStep} — {steps[wizardStep - 1].title}
            </h2>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{steps[wizardStep - 1].subtitle}</p>
        </div>

        <div className="px-6 py-6">
          {error && wizardStep < 4 && (
            <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-800 dark:bg-error-950/40 dark:text-error-300">
              {error}
            </div>
          )}

          {wizardStep === 1 && (
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Identitas sewa</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Nama penyewa *" value={partnerName} onChange={setPartnerName} placeholder="Nama perorangan / badan usaha" />
                  <CustomSelect
                    label="Kategori penyewa *"
                    value={tenantCategory}
                    options={[
                      { value: "bisnis", label: "Bisnis (komersial)" },
                      { value: "non-bisnis", label: "Non-bisnis" },
                      { value: "sosial", label: "Sosial / kemasyarakatan" },
                    ]}
                    onChange={(v) => onTenantCategoryChange(v)}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Luas tanah (m²)</p>
                  <div className="relative">
                    <input type="number" value={landArea === "" ? "" : landArea} onChange={(e) => setLandArea(e.target.value === "" ? "" : Number(e.target.value))} placeholder="0" onWheel={(e) => (e.target as HTMLInputElement).blur()} className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-3 pr-12 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">m²</span>
                  </div>
                </div>
                <CustomSelect
                  label="Nilai wajar tanah (WT)"
                  value={selectedLandValueId}
                  options={(master?.fair_land_values || []).map((wt) => ({
                    value: wt.id,
                    label: `${wt.asset_location} — ${wt.road_name}`,
                    subLabel: `${formatCurrency(Number(wt.appraised_value ?? 0))}/m²`
                  }))}
                  onChange={setSelectedLandValueId}
                />
                <CustomSelect
                  label="Entitas penyewa (FP1)"
                  value={selectedLandEntityFactorId}
                  placeholder="— Pilih Entitas —"
                  options={landEntityFactorRows.map((f) => ({
                    value: f.id,
                    label: f.entity_type,
                    subLabel: `${f.category} (${Number(f.percentage)}%)`
                  }))}
                  onChange={(v) => {
                    const id = v;
                    setSelectedLandEntityFactorId(id);
                    const row = landEntityFactorRows.find((r) => r.id === id);
                    if (row) setTenantCategory(categoryStringToTenantCategory(row.category));
                  }}
                />
                <CustomSelect
                  label="Lokasi aset (FP2)"
                  value={selectedLocationFactorId}
                  options={(master?.location_adjustment_factors || []).map((l) => ({
                    value: l.id,
                    label: l.location,
                    subLabel: `${l.percentage}%`
                  }))}
                  onChange={setSelectedLocationFactorId}
                />
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6 shadow-sm dark:border-brand-900/40 dark:from-brand-950/20 dark:to-gray-900">
                <div className="relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-300"><span className="text-sm">🌿</span></div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nilai sewa tanah (dasar tahunan)</p>
                  </div>
                  <p className="mt-3 text-4xl font-black text-brand-600 tracking-tight">{formatCurrency(previewLandBase)}</p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Belum termasuk penyesuaian periode & opsi pembayaran (FP3 & FP4).
                  </p>
                  <div className="mt-4 rounded-lg bg-white/60 p-3 backdrop-blur-sm border border-brand-200/50 dark:bg-gray-900/50 dark:border-gray-800">
                    <p className="font-mono text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                      {landArea} m² × VT({rentalVarLand}%) × WT(
                      {Number(selectedLandValue?.appraised_value ?? 0).toLocaleString("id-ID")}) × FP1({fp1LandPct}%) × FP2({fp2Pct}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Luas bangunan (m²)</p>
                  <div className="relative">
                    <input type="number" value={buildingArea === "" ? "" : buildingArea} onChange={(e) => setBuildingArea(e.target.value === "" ? "" : Number(e.target.value))} placeholder="0" onWheel={(e) => (e.target as HTMLInputElement).blur()} className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-3 pr-12 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">m²</span>
                  </div>
                </div>
                <CustomSelect
                  label="Nilai wajar bangunan (WB)"
                  value={selectedBuildingValueId}
                  options={(master?.fair_building_values || []).map((wb) => ({
                    value: wb.id,
                    label: `${wb.asset_location} — ${wb.category}`,
                    subLabel: `${formatCurrency(Number(wb.rent_price_index ?? 0))}/m²`
                  }))}
                  onChange={setSelectedBuildingValueId}
                />
                <CustomSelect
                  label="Entitas penyewa (FP1)"
                  value={selectedBuildingEntityFactorId}
                  placeholder="— Pilih Entitas —"
                  options={buildingEntityFactorRows.map((f) => ({
                    value: f.id,
                    label: f.entity_type,
                    subLabel: `${f.category} (${Number(f.percentage)}%)`
                  }))}
                  onChange={(v) => {
                    const id = v;
                    setSelectedBuildingEntityFactorId(id);
                    const row = buildingEntityFactorRows.find((r) => r.id === id);
                    if (row) setTenantCategory(categoryStringToTenantCategory(row.category));
                  }}
                />
                <CustomSelect
                  label="Lokasi aset (FP2)"
                  value={selectedLocationFactorId}
                  options={(master?.location_adjustment_factors || []).map((l) => ({
                    value: l.id,
                    label: l.location,
                    subLabel: `${l.percentage}%`
                  }))}
                  onChange={setSelectedLocationFactorId}
                />
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6 shadow-sm dark:border-brand-900/40 dark:from-brand-950/20 dark:to-gray-900">
                <div className="relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-300"><span className="text-sm">🏢</span></div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nilai sewa bangunan (dasar tahunan)</p>
                  </div>
                  <p className="mt-3 text-4xl font-black text-brand-600 tracking-tight">{formatCurrency(previewBuildingBase)}</p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Belum termasuk penyesuaian periode & opsi pembayaran (FP3 & FP4).
                  </p>
                  <div className="mt-4 rounded-lg bg-white/60 p-3 backdrop-blur-sm border border-brand-200/50 dark:bg-gray-900/50 dark:border-gray-800">
                    <p className="font-mono text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                      {buildingArea} m² × VB({rentalVarBuilding}%) × WB(
                      {Number(selectedBuildingValue?.rent_price_index ?? 0).toLocaleString("id-ID")}) × FP1({fp1BuildingPct}%) × FP2({fp2Pct}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-5">
              <p className="text-sm text-gray-600 dark:text-gray-400">Tambahkan semua biaya overhead yang relevan.</p>
              <div className="space-y-3">
                {overheads.map((item, idx) => (
                  <div key={idx} className="grid gap-2 sm:grid-cols-[1fr_140px_auto]">
                    <input value={item.name} onChange={(e) => onChangeOverhead(idx, "name", e.target.value)} placeholder="Nama biaya overhead (cth: Kebersihan, Listrik)" className="h-11 rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                    <input type="number" value={item.amount === "" ? "" : item.amount} onChange={(e) => onChangeOverhead(idx, "amount", e.target.value === "" ? "" : Number(e.target.value))} placeholder="Rp 0" onWheel={(e) => (e.target as HTMLInputElement).blur()} className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                    <button type="button" onClick={() => onRemoveOverhead(idx)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-error-200 bg-white text-error-600 hover:bg-error-50 dark:border-error-800 dark:bg-gray-900 dark:hover:bg-error-950/30" aria-label="Hapus baris">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={onAddOverhead} className="inline-flex items-center gap-2 rounded-lg border border-brand-300 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-950/40 dark:text-brand-200 dark:hover:bg-brand-900/50">
                <span className="text-lg leading-none">+</span> Tambah biaya overhead
              </button>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total biaya overhead</p>
                <p className="mt-2 text-4xl font-black text-brand-600 tracking-tight">{formatCurrency(overheadTotal)}</p>
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <div className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Periode & durasi sewa</p>
                <p className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Satuan periode sewa *</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(
                    [
                      ["year", "Tahunan"],
                      ["month", "Bulanan"],
                      ["day", "Harian"],
                      ["hour", "Per jam"],
                    ] as const
                  ).map(([k, label]) => (
                    <SegmentButton key={k} active={periodType === k} onClick={() => setPeriodType(k)}>
                      {label}
                    </SegmentButton>
                  ))}
                </div>
                {periodType !== "year" && (
                  <div className="mt-3 rounded-lg border border-blue-light-100 bg-blue-light-25 p-3 dark:border-blue-light-900/30 dark:bg-blue-light-950/20">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-light-700 dark:text-blue-light-300">Cara hitung</p>
                    <p className="mt-1 text-xs text-blue-light-600 dark:text-blue-light-400">
                      {periodType === "month" && "HPP tahunan dibagi 12 untuk tarif bulanan."}
                      {periodType === "day" && "HPP tahunan dibagi 365 untuk tarif harian."}
                      {periodType === "hour" && "HPP tahunan dibagi 8760 jam (24 jam × 365 hari) untuk tarif per jam."}
                    </p>
                  </div>
                )}
                {periodType === "year" && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Durasi sewa *</p>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((y) => (
                        <SegmentButton key={y} active={durationYears === y} onClick={() => setDurationYears(y)}>
                          {y} tahun
                        </SegmentButton>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Maksimal 5 tahun sesuai ketentuan.</p>
                  </div>
                )}
                </div>

                <FactorPanels
                  selectedPeriodFactorLabel={selectedPeriodFactorLabel}
                  fp3Pct={fp3Pct}
                  paymentType={paymentType}
                  setPaymentType={setPaymentType}
                  terminDisabled={terminDisabled}
                  selectedPaymentFactorId={selectedPaymentFactorId}
                  selectedPaymentFactorLabel={selectedPaymentFactorLabel}
                  periodType={periodType}
                  durationYears={Number(durationYears)}
                  hpptWithMargin={costingCore.hpptWithMargin}
                  fp4Pct={fp4Pct}
                  paymentFactors={master?.payment_adjustment_factors || []}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nilai sewa tanah</p>
                  <p className="mt-1 text-xl font-bold text-brand-600">{formatCurrency(costingCore.totalLandRentYearly)}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nilai sewa bangunan</p>
                  <p className="mt-1 text-xl font-bold text-brand-600">{formatCurrency(costingCore.totalBuildingRentYearly)}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Overhead</p>
                  <p className="mt-1 text-xl font-bold text-brand-600">{formatCurrency(costingCore.overheadTotal)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-5 shadow-sm dark:border-brand-900/30 dark:bg-brand-950/20">
                <p className="text-[11px] font-bold uppercase tracking-wider text-brand-800 dark:text-brand-300">Margin fee</p>
                <p className="mt-1 text-2xl font-bold text-brand-600">{Number(marginFee).toFixed(2)}%</p>
                <p className="mt-1 text-xs text-brand-700 dark:text-brand-400">Diambil otomatis dari tabel master data.</p>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white shadow-lg shadow-brand-500/20">
                <div className="absolute -right-4 -top-4 opacity-10 blur-xl">
                  <div className="h-40 w-40 rounded-full bg-white"></div>
                </div>
                <div className="relative z-10">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">HPP sewa tahunan (basis)</p>
                  <p className="mt-2 text-4xl font-black tracking-tight">{formatCurrency(costingCore.hpptWithMargin)}</p>
                  <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-white/90">
                    <span className="opacity-80">(Tanah + Bangunan + Overhead) × (1 + Margin%)</span>
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/50 p-6 dark:border-brand-800 dark:bg-brand-950/30">
                <p className="text-sm font-semibold text-brand-900 dark:text-brand-100 flex items-center gap-2">
                  <span>💰</span> {hppLunasLabel}
                </p>
                <p className="mt-2 text-3xl font-bold text-brand-700 tracking-tight dark:text-brand-300">{formatCurrency(costingCore.selectedHpp)}</p>
                {periodType === "year" && paymentType === "installment" && (
                  <div className="mt-3 rounded-lg border border-brand-200 bg-white/70 p-3 dark:border-brand-800 dark:bg-gray-900/40">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">Rincian pembayaran per tahun</p>
                    <div className="mt-2 grid gap-1">
                      {Array.from({ length: Number(durationYears) }, (_, i) => (
                        <div key={i} className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-900">
                          <span>Tahun {i + 1}</span>
                          <span className="font-semibold">{formatCurrency(costingCore.selectedHpp)}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      Total kontrak {durationYears} tahun: {formatCurrency(costingCore.selectedHpp * Number(durationYears))}
                    </p>
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  {periodType === "year" && paymentType === "lumpsum"
                    ? `${fp4Pct.toFixed(0)}% × HPP tahunan × ${durationYears} tahun — sudah termasuk dalam kalkulasi FP3 & FP4.`
                    : "Sudah memperhitungkan satuan periode, durasi sewa, serta faktor FP3 dan FP4 sesuai pilihan kontrak."}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900/50">
          {wizardStep > 1 ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setWizardStep((s) => Math.max(1, s - 1));
              }}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              ← Kembali
            </button>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap justify-end gap-2 sm:ml-auto">
            {wizardStep === 1 && (
              <button
                type="button"
                onClick={() => {
                  if (!canGoNext()) {
                    setError("Isi nama penyewa untuk melanjutkan.");
                    return;
                  }
                  setError(null);
                  setWizardStep(2);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
              >
                Lanjut ke Step 2 <span aria-hidden>→</span>
              </button>
            )}
            {wizardStep === 2 && (
              <button type="button" onClick={() => { setError(null); setWizardStep(3); }} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600">
                Lanjut ke Step 3 <span aria-hidden>→</span>
              </button>
            )}
            {wizardStep === 3 && (
              <button type="button" onClick={() => { setError(null); setWizardStep(4); }} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600">
                Lanjut ke Step 4 <span aria-hidden>→</span>
              </button>
            )}
            {wizardStep === 4 && (
              <button type="button" onClick={goToPricing} className="inline-flex items-center gap-2 rounded-lg bg-success-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-success-600 dark:bg-success-600 dark:hover:bg-success-500">
                Lanjut ke analisa harga <span aria-hidden>↗</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FactorPanels({
  selectedPeriodFactorLabel,
  fp3Pct,
  paymentType,
  setPaymentType,
  terminDisabled,
  selectedPaymentFactorId,
  selectedPaymentFactorLabel,
  periodType,
  durationYears,
  hpptWithMargin,
  fp4Pct,
  paymentFactors,
}: {
  selectedPeriodFactorLabel: string;
  fp3Pct: number;
  paymentType: PaymentType;
  setPaymentType: (v: PaymentType) => void;
  terminDisabled: boolean;
  selectedPaymentFactorId: number | null;
  selectedPaymentFactorLabel: string;
  periodType: PeriodType;
  durationYears: number;
  hpptWithMargin: number;
  fp4Pct: number;
  paymentFactors: HppMasterData["payment_adjustment_factors"];
}) {
  const selectedFactor = paymentFactors.find((p) => p.id === selectedPaymentFactorId);

  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
      <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
        <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Periode sewa (FP3) — otomatis dari durasi sewa</p>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-gray-700 dark:text-gray-300">{selectedPeriodFactorLabel || "—"}</span>
          <span className="text-lg font-bold text-brand-600">{fp3Pct.toFixed(0)}%</span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${Math.min(100, fp3Pct)}%` }} />
        </div>
      </div>

      <div className="mt-3">
        <p className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">Mekanisme pembayaran (FP4)</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setPaymentType("lumpsum")}
            className={`flex gap-3 rounded-xl border-2 p-4 text-left transition ${
              paymentType === "lumpsum"
                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/25"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
            }`}
          >
            <span className="text-2xl" aria-hidden>💳</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Lunas</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{fp4Pct.toFixed(0)}% — bayar sekaligus seluruh masa sewa</p>
            </div>
          </button>
          <button
            type="button"
            disabled={terminDisabled}
            onClick={() => !terminDisabled && setPaymentType("installment")}
            className={`flex gap-3 rounded-xl border-2 p-4 text-left transition ${
              terminDisabled
                ? "cursor-not-allowed border-gray-100 bg-gray-50 opacity-60 dark:border-gray-800 dark:bg-gray-900/40"
                : paymentType === "installment"
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/25"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
            }`}
          >
            <span className="text-2xl" aria-hidden>📅</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Termin</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {terminDisabled ? "Hanya tersedia untuk sewa tahunan > 1 tahun" : "Pembayaran bertahap sesuai faktor termin"}
              </p>
            </div>
          </button>
        </div>
        <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs text-brand-900 dark:border-brand-800 dark:bg-brand-950/30 dark:text-brand-100">
          <p className="font-semibold">Rate dipilih otomatis</p>
          <p className="mt-1">
            {selectedPaymentFactorLabel || selectedFactor?.lease_term || "Belum ada faktor pembayaran yang cocok"} ({fp4Pct.toFixed(0)}%)
          </p>
          {periodType === "year" && paymentType === "installment" && (
            <p className="mt-1 text-brand-700 dark:text-brand-300">
              Estimasi bayar per tahun: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(hpptWithMargin * (fp4Pct / 100))}
              {" "}selama {durationYears} tahun.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
