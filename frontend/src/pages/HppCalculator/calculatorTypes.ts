export type TenantCategory = "bisnis" | "non-bisnis" | "sosial";
export type PeriodType = "year" | "month" | "day" | "hour";
export type PaymentType = "lumpsum" | "installment";

export type OverheadItem = {
  name: string;
  amount: number;
};

export type RentVariable = {
  id: number;
  name: string;
  value: number;
};

export type FairLandValue = {
  id: number;
  asset_location: string;
  road_name: string;
  appraised_value: number;
};

export type FairBuildingValue = {
  id: number;
  asset_location: string;
  category: string;
  rent_price_index: number;
};

export type EntityAdjustmentFactor = {
  id: number;
  entity_type: string;
  category: string;
  percentage: number;
};

export type LocationAdjustmentFactor = {
  id: number;
  location: string;
  percentage: number;
};

export type PeriodAdjustmentFactor = {
  id: number;
  period_duration: string;
  min_year: number;
  max_year: number;
  percentage: number;
};

export type PaymentAdjustmentFactor = {
  id: number;
  lease_term: string;
  rate: number;
  description?: string | null;
};

export type Tax = {
  id: number;
  name: string;
  rate: number;
  coverage: number;
};

export type MarginFee = {
  id?: number;
  name?: string;
  rate: number;
} | null;

export type HppMasterData = {
  rent_variables: RentVariable[];
  fair_land_values: FairLandValue[];
  fair_building_values: FairBuildingValue[];
  entity_adjustment_factors: EntityAdjustmentFactor[];
  location_adjustment_factors: LocationAdjustmentFactor[];
  period_adjustment_factors: PeriodAdjustmentFactor[];
  payment_adjustment_factors: PaymentAdjustmentFactor[];
  taxes: Tax[];
  margin_fee: MarginFee;
};

export type CostingInputs = {
  landArea: number;
  buildingArea: number;
  fairLand: number;
  fairBuilding: number;
  rentalVarLandPct: number;
  rentalVarBuildingPct: number;
  fp1LandPct: number;
  fp1BuildingPct: number;
  fp2Pct: number;
  fp3Pct: number;
  fp4Pct: number;
  overheadTotal: number;
  marginFeePct: number;
  periodType: PeriodType;
  paymentType: PaymentType;
  durationYears: number;
};

export type CostingResult = {
  totalLandRentYearly: number;
  totalBuildingRentYearly: number;
  overheadTotal: number;
  hppBaseYearly: number;
  hpptWithMargin: number;
  selectedHpp: number;
};

export type TaxBreakdownRow = {
  id?: number;
  name: string;
  dpp: number;
  amount: number;
  isPpn?: boolean;
};

export type TaxBreakdownResult = {
  dpp: number;
  totalTax: number;
  taxes: TaxBreakdownRow[];
};

export type PricingCoverageLine = {
  id: number;
  name: string;
  coveragePct: number;
  amount: number;
};

export type PricingRecommendation = {
  grossRecommended: number;
  grossRounded: number;
  coverageLines: PricingCoverageLine[];
  totalCoveragePct: number;
};

export type PricingSimulationResult = {
  gross: number;
  totalTax: number;
  taxes: TaxBreakdownRow[];
  netAmount: number;
  isFeasible: boolean;
  shortfall: number;
};

export type CalculationSnapshot = {
  total_land_rent_yearly: number;
  total_building_rent_yearly: number;
  total_overhead: number;
  hpp_base_yearly: number;
  hppt_with_margin: number;
  selected_hpp: number;
  gross_recommended: number;
  gross_recommended_rounded: number;
  total_tax: number;
  net_amount: number;
  is_feasible: boolean;
  taxes: TaxBreakdownRow[];
};
