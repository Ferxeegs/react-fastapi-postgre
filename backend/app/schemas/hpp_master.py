from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class RentVariableBase(BaseModel):
    name: str
    value: float


class RentVariableCreate(RentVariableBase):
    pass


class RentVariableUpdate(BaseModel):
    name: Optional[str] = None
    value: Optional[float] = None


class RentVariableRead(RentVariableBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class FairLandValueBase(BaseModel):
    asset_location: str
    road_name: str
    appraised_value: float


class FairLandValueCreate(FairLandValueBase):
    pass


class FairLandValueUpdate(BaseModel):
    asset_location: Optional[str] = None
    road_name: Optional[str] = None
    appraised_value: Optional[float] = None


class FairLandValueRead(FairLandValueBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class FairBuildingValueBase(BaseModel):
    asset_location: str
    category: str
    rent_price_index: float


class FairBuildingValueCreate(FairBuildingValueBase):
    pass


class FairBuildingValueUpdate(BaseModel):
    asset_location: Optional[str] = None
    category: Optional[str] = None
    rent_price_index: Optional[float] = None


class FairBuildingValueRead(FairBuildingValueBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class EntityAdjustmentFactorBase(BaseModel):
    entity_type: str
    category: str
    percentage: float


class EntityAdjustmentFactorCreate(EntityAdjustmentFactorBase):
    pass


class EntityAdjustmentFactorUpdate(BaseModel):
    entity_type: Optional[str] = None
    category: Optional[str] = None
    percentage: Optional[float] = None


class EntityAdjustmentFactorRead(EntityAdjustmentFactorBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class LocationAdjustmentFactorBase(BaseModel):
    location: str
    percentage: float


class LocationAdjustmentFactorCreate(LocationAdjustmentFactorBase):
    pass


class LocationAdjustmentFactorUpdate(BaseModel):
    location: Optional[str] = None
    percentage: Optional[float] = None


class LocationAdjustmentFactorRead(LocationAdjustmentFactorBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PeriodAdjustmentFactorBase(BaseModel):
    period_duration: str
    min_year: int = Field(ge=1, le=99, description="Rentang durasi sewa (tahun) — batas bawah")
    max_year: int = Field(ge=1, le=99, description="Rentang durasi sewa (tahun) — batas atas")
    percentage: float

    @model_validator(mode="after")
    def _min_lte_max(self) -> "PeriodAdjustmentFactorBase":
        if self.min_year > self.max_year:
            raise ValueError("min_year must be <= max_year")
        return self


class PeriodAdjustmentFactorCreate(PeriodAdjustmentFactorBase):
    pass


class PeriodAdjustmentFactorUpdate(BaseModel):
    period_duration: Optional[str] = None
    min_year: Optional[int] = Field(None, ge=1, le=99)
    max_year: Optional[int] = Field(None, ge=1, le=99)
    percentage: Optional[float] = None

    @model_validator(mode="after")
    def _min_lte_max(self) -> "PeriodAdjustmentFactorUpdate":
        if self.min_year is not None and self.max_year is not None and self.min_year > self.max_year:
            raise ValueError("min_year must be <= max_year")
        return self


class PeriodAdjustmentFactorRead(PeriodAdjustmentFactorBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PaymentAdjustmentFactorBase(BaseModel):
    lease_term: str
    rate: float
    description: Optional[str] = None


class PaymentAdjustmentFactorCreate(PaymentAdjustmentFactorBase):
    pass


class PaymentAdjustmentFactorUpdate(BaseModel):
    lease_term: Optional[str] = None
    rate: Optional[float] = None
    description: Optional[str] = None


class PaymentAdjustmentFactorRead(PaymentAdjustmentFactorBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TaxBase(BaseModel):
    name: str
    rate: float
    coverage: float
    description: Optional[str] = None


class TaxCreate(TaxBase):
    pass


class TaxUpdate(BaseModel):
    name: Optional[str] = None
    rate: Optional[float] = None
    coverage: Optional[float] = None
    description: Optional[str] = None


class TaxRead(TaxBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class MarginFeeBase(BaseModel):
    name: str
    rate: float


class MarginFeeCreate(MarginFeeBase):
    pass


class MarginFeeUpdate(BaseModel):
    name: Optional[str] = None
    rate: Optional[float] = None


class MarginFeeRead(MarginFeeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
