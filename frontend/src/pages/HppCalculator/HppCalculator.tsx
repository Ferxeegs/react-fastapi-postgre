import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { hppAPI } from "../../utils/api";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import {
  buildCalculationSnapshot,
  computeCosting,
  computePricingRecommendation,
  computePricingSimulation,
  parseCurrencyInput,
  toSafeNumber,
} from "./calculatorEngine";
import { categoryStringToTenantCategory, formatEntityFactorOptionLabel } from "./entityFactorLabels";
import { CalculatorHeader } from "./components/CalculatorHeader";
import { CostingSection } from "./components/CostingSection";
import { PricingSection } from "./components/PricingSection";
import type {
  CalculationSnapshot,
  EntityAdjustmentFactor,
  FairBuildingValue,
  FairLandValue,
  HppMasterData,
  LocationAdjustmentFactor,
  OverheadItem,
  PaymentAdjustmentFactor,
  PeriodAdjustmentFactor,
  Tax,
  TenantCategory,
} from "./calculatorTypes";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    Number.isFinite(value) ? value : 0
  );

export default function PublicHppCalculator({
  embeddedAdmin = false,
}: {
  embeddedAdmin?: boolean;
}) {
  const { theme, toggleTheme } = useTheme();
  const { success } = useToast();
  const [loadingMaster, setLoadingMaster] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculationSnapshot | null>(null);

  const [master, setMaster] = useState<HppMasterData | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [assetLandType, setAssetLandType] = useState<"BMN" | "BMU">("BMU");
  const [landArea, setLandArea] = useState<number | "">("");
  const [buildingArea, setBuildingArea] = useState<number | "">("");
  const [selectedLandValueId, setSelectedLandValueId] = useState<number | null>(null);
  const [selectedBuildingValueId, setSelectedBuildingValueId] = useState<number | null>(null);
  const [selectedLandEntityFactorId, setSelectedLandEntityFactorId] = useState<number | null>(null);
  const [selectedBuildingEntityFactorId, setSelectedBuildingEntityFactorId] = useState<number | null>(null);
  const [selectedLocationFactorId, setSelectedLocationFactorId] = useState<number | null>(null);
  const [selectedPeriodFactorId, setSelectedPeriodFactorId] = useState<number | null>(null);
  const [selectedPaymentFactorId, setSelectedPaymentFactorId] = useState<number | null>(null);
  const [periodType, setPeriodType] = useState<"year" | "month" | "day" | "hour">("year");
  const [paymentType, setPaymentType] = useState<"lumpsum" | "installment">("lumpsum");
  const [durationYears, setDurationYears] = useState<number | "">(1);
  const [overheads, setOverheads] = useState<OverheadItem[]>([{ name: "", amount: "" }]);
  const [selectedTaxes, setSelectedTaxes] = useState<number[]>([]);
  const [tenantCategory, setTenantCategory] = useState<"bisnis" | "non-bisnis" | "sosial">("bisnis");
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [mainPhase, setMainPhase] = useState<"costing" | "pricing">("costing");
  const [wizardStep, setWizardStep] = useState(1);
  const [simulatedGrossStr, setSimulatedGrossStr] = useState("");
  const WIZARD_STEPS = [
    { id: 1, title: "Nilai sewa tanah", subtitle: "Identitas sewa, luas, WT, FP1 & FP2 (dasar tahunan)" },
    { id: 2, title: "Nilai sewa bangunan", subtitle: "Luas, WB, FP1 & FP2 (dasar tahunan)" },
    { id: 3, title: "Biaya overhead", subtitle: "Daftar biaya operasional" },
    { id: 4, title: "HPP sewa", subtitle: "Satuan periode, durasi, FP3–FP4, margin & ringkasan" },
  ] as const;

  const canGoNext = () => {
    if (wizardStep === 1) return partnerName.trim().length > 0;
    return true;
  };

  useEffect(() => {
    const run = async () => {
      setLoadingMaster(true);
      const [rv, lv, bv, ef, lf, pf, payf, tx, mf] = await Promise.all([
        hppAPI.getAdminRentalVariables(),
        hppAPI.getAdminLandValues(),
        hppAPI.getAdminBuildingValues(),
        hppAPI.getAdminEntityFactors(),
        hppAPI.getAdminLocationFactors(),
        hppAPI.getAdminPeriodFactors(),
        hppAPI.getAdminPaymentFactors(),
        hppAPI.getAdminTaxes(),
        hppAPI.getAdminMarginFee(),
      ]);

      if (rv.success && lv.success && bv.success && ef.success && lf.success && pf.success && payf.success && tx.success) {
        const loaded: HppMasterData = {
          rent_variables: (rv.data || []) as HppMasterData["rent_variables"],
          fair_land_values: (lv.data || []) as FairLandValue[],
          fair_building_values: (bv.data || []) as FairBuildingValue[],
          entity_adjustment_factors: (ef.data || []) as EntityAdjustmentFactor[],
          location_adjustment_factors: (lf.data || []) as LocationAdjustmentFactor[],
          period_adjustment_factors: (pf.data || []) as PeriodAdjustmentFactor[],
          payment_adjustment_factors: (payf.data || []) as PaymentAdjustmentFactor[],
          taxes: (tx.data || []) as Tax[],
          margin_fee: (mf.success ? mf.data : null) as HppMasterData["margin_fee"],
        };
        setMaster(loaded);

        if (loaded.fair_land_values.length > 0) setSelectedLandValueId(loaded.fair_land_values[0].id);
        if (loaded.fair_building_values.length > 0) setSelectedBuildingValueId(loaded.fair_building_values[0].id);
        if (loaded.location_adjustment_factors.length > 0) setSelectedLocationFactorId(loaded.location_adjustment_factors[0].id);
        if (loaded.period_adjustment_factors.length > 0) setSelectedPeriodFactorId(loaded.period_adjustment_factors[0].id);
        if (loaded.payment_adjustment_factors.length > 0) setSelectedPaymentFactorId(loaded.payment_adjustment_factors[0].id);

        const margin = Number(loaded.margin_fee?.rate ?? 10);
        setMarginFee(margin);
      } else {
        setError("Gagal mengambil master data kalkulator.");
      }
      setLoadingMaster(false);
    };
    run();
  }, []);

  const rentalVarLand = useMemo(
    () => toSafeNumber(master?.rent_variables?.find((v) => String(v.name).toLowerCase().includes("tanah"))?.value, 100),
    [master]
  );
  const rentalVarBuilding = useMemo(
    () => toSafeNumber(master?.rent_variables?.find((v) => String(v.name).toLowerCase().includes("bangunan"))?.value, 100),
    [master]
  );
  const [marginFee, setMarginFee] = useState<number | "">(10);

  const selectedLandValue = useMemo(
    () => master?.fair_land_values?.find((v) => v.id === selectedLandValueId),
    [master, selectedLandValueId]
  );
  const selectedBuildingValue = useMemo(
    () => master?.fair_building_values?.find((v) => v.id === selectedBuildingValueId),
    [master, selectedBuildingValueId]
  );
  const selectedLocationFactor = useMemo(
    () => master?.location_adjustment_factors?.find((v) => v.id === selectedLocationFactorId),
    [master, selectedLocationFactorId]
  );
  const selectedPeriodFactor = useMemo(
    () => master?.period_adjustment_factors?.find((v) => v.id === selectedPeriodFactorId),
    [master, selectedPeriodFactorId]
  );
  const selectedPaymentFactor = useMemo(
    () => master?.payment_adjustment_factors?.find((v) => v.id === selectedPaymentFactorId),
    [master, selectedPaymentFactorId]
  );

  const landEntityFactorRows = useMemo(() => {
    const factors = master?.entity_adjustment_factors || [];
    const keyword = assetLandType === "BMN" ? "bmn" : "bmu";
    const filtered = factors.filter((f) => String(f.entity_type).toLowerCase().includes(keyword));
    return filtered.length > 0 ? filtered : [...factors];
  }, [master, assetLandType]);

  const buildingEntityFactorRows = useMemo(() => master?.entity_adjustment_factors || [], [master]);

  useEffect(() => {
    if (selectedLandEntityFactorId == null && landEntityFactorRows.length > 0) {
      setSelectedLandEntityFactorId(landEntityFactorRows[0].id);
    }
  }, [landEntityFactorRows, selectedLandEntityFactorId]);
  useEffect(() => {
    if (selectedBuildingEntityFactorId == null && buildingEntityFactorRows.length > 0) {
      setSelectedBuildingEntityFactorId(buildingEntityFactorRows[0].id);
    }
  }, [buildingEntityFactorRows, selectedBuildingEntityFactorId]);

  const handleTenantCategoryChange = useCallback(
    (cat: TenantCategory) => {
      setTenantCategory(cat);
      const pick = (rows: EntityAdjustmentFactor[], currentId: number | null) => {
        const cur = master?.entity_adjustment_factors?.find((f) => f.id === currentId);
        const curType = cur?.entity_type;
        return (
          rows.find((f) => categoryStringToTenantCategory(f.category) === cat && f.entity_type === curType) ??
          rows.find((f) => categoryStringToTenantCategory(f.category) === cat)
        );
      };
      const lr = pick(landEntityFactorRows, selectedLandEntityFactorId);
      if (lr) setSelectedLandEntityFactorId(lr.id);
      const br = pick(buildingEntityFactorRows, selectedBuildingEntityFactorId);
      if (br) setSelectedBuildingEntityFactorId(br.id);
    },
    [
      master,
      landEntityFactorRows,
      buildingEntityFactorRows,
      selectedLandEntityFactorId,
      selectedBuildingEntityFactorId,
    ]
  );

  useEffect(() => {
    const factors = master?.period_adjustment_factors || [];
    const key = periodType === "year" ? "tahun" : periodType === "month" ? "bulan" : periodType === "day" ? "hari" : "jam";
    const candidates = factors.filter((f) => String(f.period_duration).toLowerCase().includes(key));
    const minY = (f: PeriodAdjustmentFactor) => (typeof f.min_year === "number" ? f.min_year : 1);
    const maxY = (f: PeriodAdjustmentFactor) => (typeof f.max_year === "number" ? f.max_year : 99);
    const matched =
      periodType === "year"
        ? candidates.find((f) => Number(durationYears) >= minY(f) && Number(durationYears) <= maxY(f)) ?? candidates[0]
        : candidates[0];
    if (matched) setSelectedPeriodFactorId(matched.id);
  }, [periodType, durationYears, master]);

  useEffect(() => {
    const factors = master?.payment_adjustment_factors || [];
    if (paymentType === "lumpsum") {
      setSelectedPaymentFactorId(null);
      return;
    }
    const extractDurationYear = (text: string): number | null => {
      const m = String(text).toLowerCase().match(/(\d+)\s*tahun/);
      if (m) return Number(m[1]);
      const n = String(text).match(/\d+/);
      return n ? Number(n[0]) : null;
    };
    const rows = factors.map((f) => {
      const lease = String(f.lease_term || "").toLowerCase();
      const desc = String(f.description || "").toLowerCase();
      const year = extractDurationYear(`${lease} ${desc}`);
      const isTerminHint = lease.includes("termin") || lease.includes("mpt") || desc.includes("termin") || desc.includes("mpt");
      const isLunasHint = lease.includes("lunas") || lease.includes("dimuka") || lease.includes("mpl") || desc.includes("lunas");
      return { f, year, isTerminHint, isLunasHint };
    });

    const exactTermin = rows.find((r) => r.year === Number(durationYears) && (r.isTerminHint || !r.isLunasHint));
    if (exactTermin) {
      setSelectedPaymentFactorId(exactTermin.f.id);
      return;
    }

    const nearestTermin = rows
      .filter((r) => r.year != null && (r.isTerminHint || !r.isLunasHint))
      .sort((a, b) => Math.abs((a.year as number) - Number(durationYears)) - Math.abs((b.year as number) - Number(durationYears)))[0];
    if (nearestTermin) {
      setSelectedPaymentFactorId(nearestTermin.f.id);
      return;
    }

    // Fallback terakhir: pakai baris pertama agar tetap ada rate.
    if (factors.length > 0) setSelectedPaymentFactorId(factors[0].id);
  }, [paymentType, durationYears, master]);

  const terminDisabled = periodType !== "year" || Number(durationYears) <= 1;
  useEffect(() => {
    if (terminDisabled && paymentType === "installment") setPaymentType("lumpsum");
  }, [terminDisabled, paymentType]);

  const fp1LandPct = useMemo(() => {
    const row = master?.entity_adjustment_factors?.find((f) => f.id === selectedLandEntityFactorId);
    return toSafeNumber(row?.percentage, 100);
  }, [master, selectedLandEntityFactorId]);
  const fp1BuildingPct = useMemo(() => {
    const row = master?.entity_adjustment_factors?.find((f) => f.id === selectedBuildingEntityFactorId);
    return toSafeNumber(row?.percentage, 100);
  }, [master, selectedBuildingEntityFactorId]);
  const fp2Pct = toSafeNumber(selectedLocationFactor?.percentage, 100);
  const fp3Pct = toSafeNumber(selectedPeriodFactor?.percentage, 100);
  const fp4Pct = paymentType === "lumpsum" ? 100 : toSafeNumber(selectedPaymentFactor?.rate, 100);

  const overheadTotal = useMemo(
    () => overheads.reduce((acc, item) => acc + (Number(item.amount) || 0), 0),
    [overheads]
  );
  /** Komponen sewa tanah/bangunan per tahun sebelum FP3 & FP4 (pratinjau langkah 1–2). */
  const previewLandBase = useMemo(
    () =>
      Number(landArea) *
      Number(selectedLandValue?.appraised_value ?? 0) *
      (rentalVarLand / 100) *
      (fp1LandPct / 100) *
      (fp2Pct / 100),
    [landArea, selectedLandValue, rentalVarLand, fp1LandPct, fp2Pct]
  );

  const previewBuildingBase = useMemo(
    () =>
      Number(buildingArea) *
      Number(selectedBuildingValue?.rent_price_index ?? 0) *
      (rentalVarBuilding / 100) *
      (fp1BuildingPct / 100) *
      (fp2Pct / 100),
    [buildingArea, selectedBuildingValue, rentalVarBuilding, fp1BuildingPct, fp2Pct]
  );

  const onAddOverhead = () => setOverheads((prev) => [...prev, { name: "", amount: 0 }]);

  const onChangeOverhead = (idx: number, key: keyof OverheadItem, value: any) => {
    setOverheads((prev) =>
      prev.map((item, index) => (index === idx ? { ...item, [key]: key === "amount" ? (value === "" ? "" : Number(value) || 0) : value } : item))
    );
  };

  const onRemoveOverhead = (idx: number) => {
    setOverheads((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  const onToggleTax = (taxId: number) => {
    setSelectedTaxes((prev) => (prev.includes(taxId) ? prev.filter((c) => c !== taxId) : [...prev, taxId]));
  };

  const costingCore = useMemo(() => {
    return computeCosting({
      landArea: Number(landArea),
      buildingArea: Number(buildingArea),
      fairLand: toSafeNumber(selectedLandValue?.appraised_value),
      fairBuilding: toSafeNumber(selectedBuildingValue?.rent_price_index),
      rentalVarLandPct: rentalVarLand,
      rentalVarBuildingPct: rentalVarBuilding,
      fp1LandPct,
      fp1BuildingPct,
      fp2Pct,
      fp3Pct,
      fp4Pct,
      overheadTotal,
      marginFeePct: toSafeNumber(marginFee),
      periodType,
      paymentType,
      durationYears: Number(durationYears),
    });
  }, [
    landArea,
    buildingArea,
    selectedLandValue,
    selectedBuildingValue,
    rentalVarLand,
    rentalVarBuilding,
    fp1LandPct,
    fp1BuildingPct,
    fp2Pct,
    fp3Pct,
    fp4Pct,
    overheadTotal,
    marginFee,
    periodType,
    paymentType,
    durationYears,
  ]);

  const selectedTaxRows = useMemo(
    () => (master?.taxes || []).filter((t) => selectedTaxes.includes(t.id)),
    [master, selectedTaxes]
  );

  const pricingBaseHpp = costingCore.hpptWithMargin;
  const pricingRecommended = useMemo(
    () => computePricingRecommendation(pricingBaseHpp, selectedTaxRows),
    [pricingBaseHpp, selectedTaxRows]
  );

  const pricingSimulation = useMemo(() => {
    const gross = parseCurrencyInput(simulatedGrossStr, pricingRecommended.grossRounded);
    return computePricingSimulation(gross, selectedTaxRows, pricingBaseHpp);
  }, [simulatedGrossStr, selectedTaxRows, pricingBaseHpp, pricingRecommended.grossRounded]);

  const calculateLocally = (): CalculationSnapshot => buildCalculationSnapshot(costingCore, pricingRecommended, selectedTaxRows);

  const onSubmit = async (saveSimulation = false) => {
    setError(null);
    setSaveNotice(null);
    if (!partnerName.trim()) {
      setError("Nama mitra wajib diisi.");
      return;
    }
    setSubmitting(true);
    const computed = calculateLocally();
    setResult(computed);
    if (saveSimulation) {
      setSaveNotice("Perhitungan tersimpan sementara di browser. Fitur simpan ke backend belum tersedia.");
      success("Snapshot kalkulasi berhasil disimpan di browser sementara.");
    }
    setSubmitting(false);
  };

  const goToPricing = () => {
    if (!partnerName.trim()) {
      setError("Isi nama penyewa terlebih dahulu.");
      return;
    }
    setError(null);
    setSimulatedGrossStr(String(pricingRecommended.grossRounded));
    setMainPhase("pricing");
  };

  const hppLunasLabel =
    periodType === "year"
      ? paymentType === "lumpsum"
        ? `HPP sewa — lunas (${durationYears} tahun)`
        : "HPP sewa — termin (tahunan)"
      : periodType === "month"
        ? "HPP sewa — bulanan"
        : periodType === "day"
          ? "HPP sewa — harian"
          : "HPP sewa — per jam";

  useEffect(() => {
    if (mainPhase !== "pricing") return;
    setSimulatedGrossStr(String(pricingRecommended.grossRounded));
  }, [mainPhase, selectedTaxes, pricingRecommended.grossRounded]);

  return (
    <>
      <PageMeta title="Kalkulator HPP Sewa Aset BMU/BMN Undip" description="Analisa HPP & Tarif Sewa Aset BMU/BMN Undip" />
      <div className={`${embeddedAdmin ? "" : "min-h-screen"} bg-gray-100 px-4 py-6 dark:bg-gray-950 sm:px-6`}>
        <div className="mx-auto max-w-7xl">
          <CalculatorHeader
            mainPhase={mainPhase}
            setMainPhase={setMainPhase}
            partnerName={partnerName}
            setError={setError}
            setSimulatedGrossStr={setSimulatedGrossStr}
            roundedGross={pricingRecommended.grossRounded}
            embeddedAdmin={embeddedAdmin}
            theme={theme}
            toggleTheme={toggleTheme}
          />

          {loadingMaster ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
              Memuat master data...
            </div>
          ) : mainPhase === "pricing" ? (
            <>
              <PricingSection
                error={error}
                setError={setError}
                setMainPhase={setMainPhase}
                selectedTaxes={selectedTaxes}
                onToggleTax={onToggleTax}
                taxes={master?.taxes || []}
                selectedHpp={pricingBaseHpp}
                pricingRecommended={pricingRecommended}
                simulatedGrossStr={simulatedGrossStr}
                setSimulatedGrossStr={setSimulatedGrossStr}
                pricingSimulation={pricingSimulation}
                onSaveSnapshot={() => onSubmit(true)}
                submitting={submitting}
                saveNotice={saveNotice}
                formatCurrency={formatCurrency}
              />
              {false && <div className="mx-auto max-w-4xl space-y-6">
              <button
                type="button"
                onClick={() => {
                  setMainPhase("costing");
                  setError(null);
                }}
                className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                ← Kembali ke analisa biaya
              </button>

              {error && (
                <div className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-800 dark:bg-error-950/40 dark:text-error-300">
                  {error}
                </div>
              )}

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-col gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">HPP sewa (referensi)</p>
                    <p className="mt-1 text-3xl font-bold text-brand-600">{formatCurrency(costingCore.selectedHpp)}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Dasar perhitungan tarif bruto dan simulasi pajak.</p>
                  </div>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-2xl dark:bg-brand-950/40">🏢</div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="border-b border-gray-100 bg-gray-50/80 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/80">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Bagian A</p>
                  <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">Rekomendasi tarif sewa (bruto)</h2>
                </div>
                <div className="space-y-6 px-6 py-6">
                  <div>
                    <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Langkah 1</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Pilih pajak yang akan dikenakan</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {(master?.taxes || []).map((tx) => {
                        const on = selectedTaxes.includes(tx.id);
                        return (
                          <label
                            key={tx.id}
                            className={`flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-4 transition ${
                              on ? "border-brand-500 bg-brand-50/80 dark:bg-brand-900/25" : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input type="checkbox" className="mt-1 rounded border-gray-300" checked={on} onChange={() => onToggleTax(tx.id)} />
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{tx.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Tarif {tx.rate}% · coverage {tx.coverage}%
                                </p>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Langkah 2</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Rekomendasi harga jual (bruto)</p>
                    <dl className="mt-4 space-y-3 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-600 dark:text-gray-400">HPP sewa</dt>
                        <dd className="font-semibold text-gray-900 dark:text-white">{formatCurrency(costingCore.selectedHpp)}</dd>
                      </div>
                      {pricingRecommended.coverageLines.map((line: { id: number; name: string; coveragePct: number; amount: number }) => (
                        <div key={line.id} className="flex justify-between gap-4">
                          <dt className="text-gray-600 dark:text-gray-400">
                            Coverage {line.name} ({line.coveragePct}%)
                          </dt>
                          <dd className="font-semibold text-brand-600">+{formatCurrency(line.amount)}</dd>
                        </div>
                      ))}
                      <div className="flex justify-between gap-4 border-t border-gray-200 pt-3 dark:border-gray-600">
                        <dt className="font-semibold text-gray-900 dark:text-white">Tarif sewa (bruto)</dt>
                        <dd className="text-lg font-bold text-brand-600">{formatCurrency(pricingRecommended.grossRecommended)}</dd>
                      </div>
                    </dl>
                    <div className="mt-4 rounded-lg border border-blue-light-200 bg-blue-light-25 px-4 py-3 text-sm text-blue-light-800 dark:border-blue-light-800 dark:bg-blue-light-950/30 dark:text-blue-light-200">
                      <span className="font-semibold">Saran pembulatan (ROUNDUP 1.000):</span> {formatCurrency(pricingRecommended.grossRounded)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="border-b border-gray-100 bg-gray-50/80 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/80">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Bagian B</p>
                  <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">Simulasi tarif</h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Ubah tarif bruto untuk melihat dampak pajak dan tarif netto; sistem membandingkan netto dengan HPP referensi.</p>
                </div>
                <div className="space-y-4 px-6 py-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Tarif bruto simulasi (Rp)</p>
                      <input
                        type="number"
                        min={0}
                        value={simulatedGrossStr}
                        onChange={(e) => setSimulatedGrossStr(e.target.value)}
                        className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm dark:border-gray-700 dark:bg-gray-800"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Gunakan nilai rekomendasi, pembulatan, atau nominal lain untuk uji coba.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSimulatedGrossStr(String(pricingRecommended.grossRounded))}
                      className="h-11 shrink-0 rounded-lg border border-brand-300 px-4 text-sm font-semibold text-brand-700 dark:text-brand-300"
                    >
                      Gunakan rekomendasi
                    </button>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        <tr>
                          <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Tarif bruto</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(pricingSimulation.gross)}</td>
                        </tr>
                        {pricingSimulation.taxes.map((t) => (
                          <tr key={t.name}>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {t.name}
                              <span className="mt-0.5 block text-xs text-gray-500">DPP = {formatCurrency(t.dpp)}</span>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-error-600 dark:text-error-400">−{formatCurrency(t.amount)}</td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                          <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Tarif netto</td>
                          <td className="px-4 py-3 text-right text-lg font-bold text-brand-600">{formatCurrency(pricingSimulation.netAmount)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {!pricingSimulation.isFeasible && (
                    <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-800 dark:border-error-800 dark:bg-error-950/40 dark:text-error-200">
                      <p className="font-semibold">Tarif kurang</p>
                      <p className="mt-1">
                        Netto ({formatCurrency(pricingSimulation.netAmount)}) &lt; HPP ({formatCurrency(costingCore.selectedHpp)}). Selisih:{" "}
                        {formatCurrency(Math.max(0, pricingSimulation.shortfall))}. Naikkan tarif bruto.
                      </p>
                    </div>
                  )}
                  {pricingSimulation.isFeasible && pricingSimulation.taxes.length > 0 && (
                    <div className="rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-800 dark:border-success-800 dark:bg-success-950/30 dark:text-success-200">
                      Netto memenuhi atau melampaui HPP referensi.
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => onSubmit(true)}
                      disabled={submitting}
                      className="rounded-lg border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-700 disabled:opacity-60 dark:text-brand-300"
                    >
                      Simpan snapshot (lokal)
                    </button>
                    {saveNotice && <p className="w-full text-xs text-blue-light-600">{saveNotice}</p>}
                  </div>
                </div>
              </div>
              </div>}
            </>
          ) : (
            <>
              <CostingSection
                wizardStep={wizardStep}
                steps={WIZARD_STEPS}
                error={error}
                partnerName={partnerName}
                setPartnerName={setPartnerName}
                tenantCategory={tenantCategory}
                onTenantCategoryChange={handleTenantCategoryChange}
                periodType={periodType}
                setPeriodType={setPeriodType}
                durationYears={durationYears}
                setDurationYears={setDurationYears}
                landArea={landArea}
                setLandArea={setLandArea}
                selectedLandValueId={selectedLandValueId}
                setSelectedLandValueId={setSelectedLandValueId}
                landEntityFactorRows={landEntityFactorRows}
                selectedLandEntityFactorId={selectedLandEntityFactorId}
                setSelectedLandEntityFactorId={setSelectedLandEntityFactorId}
                selectedLocationFactorId={selectedLocationFactorId}
                setSelectedLocationFactorId={setSelectedLocationFactorId}
                selectedPeriodFactorLabel={selectedPeriodFactor?.period_duration || ""}
                fp3Pct={fp3Pct}
                paymentType={paymentType}
                setPaymentType={setPaymentType}
                terminDisabled={terminDisabled}
                selectedPaymentFactorId={selectedPaymentFactorId}
                selectedPaymentFactorLabel={paymentType === "lumpsum" ? "Lunas (tetap)" : selectedPaymentFactor?.lease_term || ""}
                fp4Pct={fp4Pct}
                selectedLandValue={selectedLandValue}
                setTenantCategory={setTenantCategory}
                rentalVarLand={rentalVarLand}
                fp1LandPct={fp1LandPct}
                fp2Pct={fp2Pct}
                previewLandBase={previewLandBase}
                buildingArea={buildingArea}
                setBuildingArea={setBuildingArea}
                selectedBuildingValueId={selectedBuildingValueId}
                setSelectedBuildingValueId={setSelectedBuildingValueId}
                buildingEntityFactorRows={buildingEntityFactorRows}
                selectedBuildingEntityFactorId={selectedBuildingEntityFactorId}
                setSelectedBuildingEntityFactorId={setSelectedBuildingEntityFactorId}
                selectedBuildingValue={selectedBuildingValue}
                rentalVarBuilding={rentalVarBuilding}
                fp1BuildingPct={fp1BuildingPct}
                previewBuildingBase={previewBuildingBase}
                overheads={overheads}
                onChangeOverhead={onChangeOverhead}
                onRemoveOverhead={onRemoveOverhead}
                onAddOverhead={onAddOverhead}
                overheadTotal={overheadTotal}
                marginFee={marginFee}
                costingCore={costingCore}
                hppLunasLabel={hppLunasLabel}
                canGoNext={canGoNext}
                setError={setError}
                setWizardStep={setWizardStep}
                goToPricing={goToPricing}
                master={master}
                formatCurrency={formatCurrency}
              />
              {false && <div className="mx-auto max-w-4xl space-y-6">
              <WizardStepper currentStep={wizardStep} steps={WIZARD_STEPS} />

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="border-b border-gray-100 bg-gray-50/80 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/80">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Analisa biaya · Langkah {wizardStep} dari {WIZARD_STEPS.length}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xl" aria-hidden>
                      {wizardStep === 1 && "🌿"}
                      {wizardStep === 2 && "🏢"}
                      {wizardStep === 3 && "📋"}
                      {wizardStep === 4 && "📊"}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Step {wizardStep} — {WIZARD_STEPS[wizardStep - 1].title}
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{WIZARD_STEPS[wizardStep - 1].subtitle}</p>
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
                          <div>
                            <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Kategori penyewa *</p>
                            <select
                              value={tenantCategory}
                              onChange={(e) => setTenantCategory(e.target.value as "bisnis" | "non-bisnis" | "sosial")}
                              className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm dark:border-gray-700 dark:bg-gray-800"
                            >
                              <option value="bisnis">Bisnis (komersial)</option>
                              <option value="non-bisnis">Non-bisnis</option>
                              <option value="sosial">Sosial / kemasyarakatan</option>
                            </select>
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Jenis aset tanah</p>
                            <select
                              value={assetLandType}
                              onChange={(e) => setAssetLandType(e.target.value as "BMN" | "BMU")}
                              className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm dark:border-gray-700 dark:bg-gray-800"
                            >
                              <option value="BMN">Tanah BMN</option>
                              <option value="BMU">Tanah BMU</option>
                            </select>
                          </div>
                        </div>
                      </div>

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

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Luas tanah (m²)</p>
                          <div className="relative">
                            <input
                              type="number"
                              value={landArea || ""}
                              onChange={(e) => setLandArea(Number(e.target.value))}
                              placeholder="0"
                              className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-3 pr-12 text-sm dark:border-gray-700 dark:bg-gray-800"
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">m²</span>
                          </div>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Nilai wajar tanah (WT)</p>
                          <select
                            value={selectedLandValueId ?? ""}
                            onChange={(e) => setSelectedLandValueId(Number(e.target.value))}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm dark:border-gray-700 dark:bg-gray-800"
                          >
                            {(master?.fair_land_values || []).map((wt) => (
                              <option key={wt.id} value={wt.id}>
                                {wt.asset_location} — {wt.road_name}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {selectedLandValue?.asset_location} — {formatCurrency(Number(selectedLandValue?.appraised_value ?? 0))}/m²
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Entitas penyewa (FP1)</p>
                          <select
                            value={selectedLandEntityFactorId ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v === "") {
                                setSelectedLandEntityFactorId(null);
                                return;
                              }
                              const id = Number(v);
                              setSelectedLandEntityFactorId(id);
                              const row = landEntityFactorRows.find((r) => r.id === id);
                              if (row) setTenantCategory(categoryStringToTenantCategory(row.category));
                            }}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm dark:border-gray-700 dark:bg-gray-800"
                          >
                            <option value="">— Pilih Entitas —</option>
                            {landEntityFactorRows.map((f) => (
                              <option key={f.id} value={f.id}>
                                {formatEntityFactorOptionLabel(f.entity_type, f.category, Number(f.percentage))}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Lokasi aset (FP2)</p>
                          <select
                            value={selectedLocationFactorId ?? ""}
                            onChange={(e) => setSelectedLocationFactorId(Number(e.target.value))}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm dark:border-gray-700 dark:bg-gray-800"
                          >
                            {(master?.location_adjustment_factors || []).map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.location} ({l.percentage}%)
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                        <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Periode sewa (FP3) — otomatis dari durasi sewa</p>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{selectedPeriodFactor?.period_duration || "—"}</span>
                          <span className="text-lg font-bold text-brand-600">{fp3Pct.toFixed(0)}%</span>
                        </div>
                        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${Math.min(100, fp3Pct)}%` }} />
                        </div>
                      </div>

                      <div>
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
                            <span className="text-2xl" aria-hidden>
                              💳
                            </span>
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
                            <span className="text-2xl" aria-hidden>
                              📅
                            </span>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">Termin</p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {terminDisabled ? "Hanya tersedia untuk sewa tahunan > 1 tahun" : "Pembayaran bertahap sesuai faktor termin"}
                              </p>
                            </div>
                          </button>
                        </div>
                        <select
                          value={selectedPaymentFactorId ?? ""}
                          onChange={(e) => setSelectedPaymentFactorId(Number(e.target.value))}
                          className="mt-3 h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                          {(master?.payment_adjustment_factors || []).map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.lease_term} ({p.rate}%)
                            </option>
                          ))}
                        </select>
                      </div>
                      </div>

                      <div className="rounded-xl border border-blue-light-200 bg-blue-light-25/90 p-5 dark:border-blue-light-800/40 dark:bg-blue-light-950/20">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nilai sewa tanah (dasar tahunan)</p>
                        <p className="mt-2 text-3xl font-bold text-brand-600">{formatCurrency(previewLandBase)}</p>
                        <p className="mt-3 font-mono text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                          {landArea} m² × VT({rentalVarLand}%) × WT(
                          {Number(selectedLandValue?.appraised_value ?? 0).toLocaleString("id-ID")}) × FP1({fp1LandPct}%) × FP2({fp2Pct}%)
                        </p>
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-6">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Luas bangunan (m²)</p>
                          <div className="relative">
                            <input
                              type="number"
                              value={buildingArea || ""}
                              onChange={(e) => setBuildingArea(Number(e.target.value))}
                              placeholder="0"
                              className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-3 pr-12 text-sm dark:border-gray-700 dark:bg-gray-800"
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">m²</span>
                          </div>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Nilai wajar bangunan (WB)</p>
                          <select
                            value={selectedBuildingValueId ?? ""}
                            onChange={(e) => setSelectedBuildingValueId(Number(e.target.value))}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm dark:border-gray-700 dark:bg-gray-800"
                          >
                            {(master?.fair_building_values || []).map((wb) => (
                              <option key={wb.id} value={wb.id}>
                                {wb.asset_location} — {wb.category}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {selectedBuildingValue?.asset_location} ({selectedBuildingValue?.category}) — {formatCurrency(Number(selectedBuildingValue?.rent_price_index ?? 0))}
                            /m²
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Entitas penyewa (FP1)</p>
                          <select
                            value={selectedBuildingEntityFactorId ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v === "") {
                                setSelectedBuildingEntityFactorId(null);
                                return;
                              }
                              const id = Number(v);
                              setSelectedBuildingEntityFactorId(id);
                              const row = buildingEntityFactorRows.find((r) => r.id === id);
                              if (row) setTenantCategory(categoryStringToTenantCategory(row.category));
                            }}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm dark:border-gray-700 dark:bg-gray-800"
                          >
                            <option value="">— Pilih Entitas —</option>
                            {buildingEntityFactorRows.map((f) => (
                              <option key={f.id} value={f.id}>
                                {formatEntityFactorOptionLabel(f.entity_type, f.category, Number(f.percentage))}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Lokasi aset (FP2)</p>
                          <select
                            value={selectedLocationFactorId ?? ""}
                            onChange={(e) => setSelectedLocationFactorId(Number(e.target.value))}
                            className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm dark:border-gray-700 dark:bg-gray-800"
                          >
                            {(master?.location_adjustment_factors || []).map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.location} ({l.percentage}%)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                        <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Periode sewa (FP3) — otomatis dari durasi sewa</p>
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{selectedPeriodFactor?.period_duration || "—"}</span>
                          <span className="text-lg font-bold text-brand-600">{fp3Pct.toFixed(0)}%</span>
                        </div>
                        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${Math.min(100, fp3Pct)}%` }} />
                        </div>
                      </div>

                      <div>
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
                            <span className="text-2xl" aria-hidden>
                              💳
                            </span>
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
                            <span className="text-2xl" aria-hidden>
                              📅
                            </span>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">Termin</p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {terminDisabled ? "Hanya tersedia untuk sewa tahunan > 1 tahun" : "Pembayaran bertahap sesuai faktor termin"}
                              </p>
                            </div>
                          </button>
                        </div>
                        <select
                          value={selectedPaymentFactorId ?? ""}
                          onChange={(e) => setSelectedPaymentFactorId(Number(e.target.value))}
                          className="mt-3 h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                          {(master?.payment_adjustment_factors || []).map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.lease_term} ({p.rate}%)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="rounded-xl border border-blue-light-200 bg-blue-light-25/90 p-5 dark:border-blue-light-800/40 dark:bg-blue-light-950/20">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nilai sewa bangunan (dasar tahunan)</p>
                        <p className="mt-2 text-3xl font-bold text-brand-600">{formatCurrency(previewBuildingBase)}</p>
                        <p className="mt-3 font-mono text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                          {buildingArea} m² × VB({rentalVarBuilding}%) × WB(
                          {Number(selectedBuildingValue?.rent_price_index ?? 0).toLocaleString("id-ID")}) × FP1({fp1BuildingPct}%) × FP2({fp2Pct}%)
                        </p>
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="space-y-5">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tambahkan semua biaya overhead yang relevan.</p>
                      <div className="space-y-3">
                        {overheads.map((item, idx) => (
                          <div key={idx} className="grid gap-2 sm:grid-cols-[1fr_140px_auto]">
                            <input
                              value={item.name}
                              onChange={(e) => onChangeOverhead(idx, "name", e.target.value)}
                              placeholder="Nama biaya overhead (cth: Kebersihan, Listrik)"
                              className="h-11 rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm dark:border-gray-700 dark:bg-gray-800"
                            />
                            <input
                              type="number"
                              value={item.amount}
                              onChange={(e) => onChangeOverhead(idx, "amount", e.target.value)}
                              placeholder="Rp 0"
                              className="h-11 rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm dark:border-gray-700 dark:bg-gray-800"
                            />
                            <button
                              type="button"
                              onClick={() => onRemoveOverhead(idx)}
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-error-200 bg-white text-error-600 hover:bg-error-50 dark:border-error-800 dark:bg-gray-900 dark:hover:bg-error-950/30"
                              aria-label="Hapus baris"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={onAddOverhead}
                        className="inline-flex items-center gap-2 rounded-lg border border-brand-300 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-950/40 dark:text-brand-200 dark:hover:bg-brand-900/50"
                      >
                        <span className="text-lg leading-none">+</span> Tambah biaya overhead
                      </button>
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total biaya overhead</p>
                        <p className="mt-2 text-3xl font-bold text-brand-600">{formatCurrency(overheadTotal)}</p>
                      </div>
                    </div>
                  )}

                  {wizardStep === 4 && (
                    <div className="space-y-5">
                      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/50">
                        <Field label="Margin fee (%)" value={String(marginFee)} onChange={(v) => setMarginFee(Number(v))} type="number" placeholder="10" />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nilai sewa tanah</p>
                          <p className="mt-2 text-2xl font-bold text-brand-600">{formatCurrency(costingCore.totalLandRentYearly)}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nilai sewa bangunan</p>
                          <p className="mt-2 text-2xl font-bold text-brand-600">{formatCurrency(costingCore.totalBuildingRentYearly)}</p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total biaya overhead</p>
                        <p className="mt-2 text-2xl font-bold text-brand-600">{formatCurrency(costingCore.overheadTotal)}</p>
                      </div>

                      <div className="rounded-xl border border-blue-light-200 bg-blue-light-25/80 p-4 dark:border-blue-light-900/40 dark:bg-blue-light-950/20">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-blue-light-800 dark:text-blue-light-300">Margin fee</p>
                        <p className="mt-2 text-2xl font-bold text-brand-600">{Number(marginFee).toFixed(2)}%</p>
                      </div>

                      <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white shadow-md">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">HPP sewa tahunan (basis)</p>
                        <p className="mt-2 text-3xl font-bold">{formatCurrency(costingCore.hpptWithMargin)}</p>
                        <p className="mt-2 text-xs text-white/85">(Tanah + Bangunan + Overhead) × (1 + Margin%)</p>
                      </div>

                      <div className="rounded-xl border-2 border-brand-200 bg-brand-50/50 p-4 dark:border-brand-800 dark:bg-brand-950/30">
                        <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">💰 {hppLunasLabel}</p>
                        <p className="mt-2 text-2xl font-bold text-brand-700 dark:text-brand-300">{formatCurrency(costingCore.selectedHpp)}</p>
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
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setWizardStep(3);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
                      >
                        Lanjut ke Step 3 <span aria-hidden>→</span>
                      </button>
                    )}
                    {wizardStep === 3 && (
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setWizardStep(4);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
                      >
                        Lanjut ke Step 4 <span aria-hidden>→</span>
                      </button>
                    )}
                    {wizardStep === 4 && (
                      <button
                        type="button"
                        onClick={goToPricing}
                        className="inline-flex items-center gap-2 rounded-lg bg-success-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-success-600 dark:bg-success-600 dark:hover:bg-success-500"
                      >
                        Lanjut ke analisa harga <span aria-hidden>↗</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              </div>}
            </>
          )}
        </div>
        <div className="sticky bottom-4 z-40 mx-4 mt-6 rounded-2xl border border-gray-200/80 bg-white/90 p-4 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] backdrop-blur-md dark:border-gray-700/80 dark:bg-gray-900/90 dark:shadow-[0_-8px_30px_rgb(0,0,0,0.4)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4 md:grid-cols-none">
              <FooterStat label="Sewa tanah" value={formatCurrency(result?.total_land_rent_yearly ?? costingCore.totalLandRentYearly)} />
              <FooterStat label="Sewa bangunan" value={formatCurrency(result?.total_building_rent_yearly ?? costingCore.totalBuildingRentYearly)} />
              <FooterStat label="Overhead" value={formatCurrency(result?.total_overhead ?? costingCore.overheadTotal)} />
              <FooterStat
                label={mainPhase === "pricing" ? "HPP sewa (ref.)" : "HPP sewa"}
                value={`${formatCurrency(result?.selected_hpp ?? costingCore.selectedHpp)}${periodType === "year" ? "/Tahun" : ""}`}
                strong
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setSaveNotice(null);
                setError(null);
                setMainPhase("costing");
                setWizardStep(1);
                setSimulatedGrossStr("");
                setOverheads([{ name: "Listrik", amount: 0 }]);
                setLandArea(0);
                setBuildingArea(0);
              }}
              className="mt-2 w-full sm:mt-0 sm:w-auto shrink-0 rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Reset Kalkulator
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function WizardStepper({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: readonly { id: number; title: string; subtitle: string }[];
}) {
  const pct = steps.length > 1 ? ((currentStep - 1) / (steps.length - 1)) * 100 : 100;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {steps.map((s) => {
          const done = currentStep > s.id;
          const active = currentStep === s.id;
          return (
            <div key={s.id} className="flex min-w-0 items-start gap-2">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  done
                    ? "bg-brand-500 text-white"
                    : active
                      ? "bg-brand-100 text-brand-800 ring-2 ring-brand-500 dark:bg-brand-900/50 dark:text-brand-200"
                      : "border border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {done ? "✓" : s.id}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold leading-tight ${active ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>{s.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{s.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div className="h-full rounded-full bg-brand-500 transition-[width] duration-300 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</p>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
    </div>
  );
}

function SegmentButton({
  active,
  onClick,
  children,
  disabled = false,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-12 rounded-lg border text-sm font-semibold transition ${
        active
          ? "border-brand-500 bg-brand-500 text-white"
          : "border-gray-300 bg-white text-gray-700 hover:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
}

function FooterStat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex flex-col rounded-xl px-4 py-2 ring-1 ring-inset ${strong ? "bg-brand-50/50 ring-brand-200 dark:bg-brand-900/20 dark:ring-brand-800" : "bg-gray-50/50 ring-gray-200 dark:bg-gray-800/50 dark:ring-gray-700"}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-0.5 ${strong ? "text-base font-bold text-brand-600 dark:text-brand-400" : "text-sm font-semibold text-gray-900 dark:text-gray-100"}`}>{value}</p>
    </div>
  );
}

