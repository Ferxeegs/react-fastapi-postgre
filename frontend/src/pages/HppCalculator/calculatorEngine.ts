import {
  CalculationSnapshot,
  CostingInputs,
  CostingResult,
  PricingRecommendation,
  PricingSimulationResult,
  Tax,
  TaxBreakdownResult,
} from "./calculatorTypes";

const roundUp = (value: number) => Math.ceil(value);
const roundUpThousand = (value: number) => Math.ceil(value / 1000) * 1000;

export function toSafeNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseCurrencyInput(value: string, fallback = 0): number {
  const parsed = Number(String(value).replace(/\s/g, "").replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

export function computeTaxBreakdown(grossRounded: number, selectedTaxRows: Tax[]): TaxBreakdownResult {
  const dpp = roundUp((100 / 111) * grossRounded);
  let totalTax = 0;
  const taxes = selectedTaxRows.map((tx) => {
    const name = String(tx.name || "");
    const rate = toSafeNumber(tx.rate);
    const isPpn = name.toLowerCase().includes("ppn");
    let amount = 0;
    if (isPpn) {
      const dppNilaiLain = roundUp((11 / 12) * dpp);
      amount = roundUp(dppNilaiLain * (rate / 100));
    } else {
      amount = roundUp(dpp * (rate / 100));
    }
    totalTax += amount;
    return { id: tx.id, name: tx.name, dpp, amount, isPpn };
  });

  return { dpp, totalTax, taxes };
}

export function computeCosting(inputs: CostingInputs): CostingResult {
  const totalLandRentYearly =
    inputs.landArea *
    inputs.fairLand *
    (inputs.rentalVarLandPct / 100) *
    (inputs.fp1LandPct / 100) *
    (inputs.fp2Pct / 100) *
    (inputs.fp3Pct / 100) *
    (inputs.fp4Pct / 100);

  const totalBuildingRentYearly =
    inputs.buildingArea *
    inputs.fairBuilding *
    (inputs.rentalVarBuildingPct / 100) *
    (inputs.fp1BuildingPct / 100) *
    (inputs.fp2Pct / 100) *
    (inputs.fp3Pct / 100) *
    (inputs.fp4Pct / 100);

  const hppBaseYearly = totalLandRentYearly + totalBuildingRentYearly + inputs.overheadTotal;
  const hpptWithMargin = hppBaseYearly * (1 + inputs.marginFeePct / 100);

  let selectedHpp = hpptWithMargin;
  if (inputs.periodType === "month") selectedHpp = (hpptWithMargin / 12) * (inputs.fp3Pct / 100);
  if (inputs.periodType === "day") selectedHpp = (hpptWithMargin / 365) * (inputs.fp3Pct / 100);
  if (inputs.periodType === "hour") selectedHpp = (hpptWithMargin / 8760) * (inputs.fp3Pct / 100);
  if (inputs.periodType === "year") {
    if (inputs.paymentType === "lumpsum") selectedHpp = hpptWithMargin * inputs.durationYears * (inputs.fp4Pct / 100);
    if (inputs.paymentType === "installment") selectedHpp = hpptWithMargin * (inputs.fp4Pct / 100);
  }

  return {
    totalLandRentYearly,
    totalBuildingRentYearly,
    overheadTotal: inputs.overheadTotal,
    hppBaseYearly,
    hpptWithMargin,
    selectedHpp,
  };
}

export function computePricingRecommendation(selectedHpp: number, selectedTaxRows: Tax[]): PricingRecommendation {
  const totalCoveragePct = selectedTaxRows.reduce((acc, t) => acc + toSafeNumber(t.coverage), 0);
  const grossRecommended = selectedHpp + selectedHpp * (totalCoveragePct / 100);
  const grossRounded = roundUpThousand(grossRecommended);
  const coverageLines = selectedTaxRows.map((tx) => ({
    id: tx.id,
    name: tx.name,
    coveragePct: toSafeNumber(tx.coverage),
    amount: selectedHpp * (toSafeNumber(tx.coverage) / 100),
  }));

  return { grossRecommended, grossRounded, coverageLines, totalCoveragePct };
}

export function computePricingSimulation(
  simulatedGross: number,
  selectedTaxRows: Tax[],
  selectedHpp: number
): PricingSimulationResult {
  const { totalTax, taxes } = computeTaxBreakdown(simulatedGross, selectedTaxRows);
  const netAmount = simulatedGross - totalTax;
  const isFeasible = netAmount >= selectedHpp;
  const shortfall = selectedHpp - netAmount;

  return { gross: simulatedGross, totalTax, taxes, netAmount, isFeasible, shortfall };
}

export function buildCalculationSnapshot(
  costing: CostingResult,
  pricing: PricingRecommendation,
  selectedTaxRows: Tax[]
): CalculationSnapshot {
  const { totalTax, taxes } = computeTaxBreakdown(pricing.grossRounded, selectedTaxRows);
  const netAmount = pricing.grossRounded - totalTax;
  const isFeasible = netAmount >= costing.selectedHpp;

  return {
    total_land_rent_yearly: costing.totalLandRentYearly,
    total_building_rent_yearly: costing.totalBuildingRentYearly,
    total_overhead: costing.overheadTotal,
    hpp_base_yearly: costing.hppBaseYearly,
    hppt_with_margin: costing.hpptWithMargin,
    selected_hpp: costing.selectedHpp,
    gross_recommended: pricing.grossRecommended,
    gross_recommended_rounded: pricing.grossRounded,
    total_tax: totalTax,
    net_amount: netAmount,
    is_feasible: isFeasible,
    taxes,
  };
}
