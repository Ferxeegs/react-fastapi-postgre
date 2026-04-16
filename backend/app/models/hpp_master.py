from sqlalchemy import BigInteger, Column, DateTime, Integer, Numeric, String
from sqlalchemy.sql import func

from app.db.base_class import Base


class RentVariable(Base):
    __tablename__ = "rent_variables"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    value = Column(Numeric(18, 4), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class FairLandValue(Base):
    __tablename__ = "fair_land_values"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    asset_location = Column(String(255), nullable=False)
    road_name = Column(String(255), nullable=False)
    appraised_value = Column(Numeric(18, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class FairBuildingValue(Base):
    __tablename__ = "fair_building_values"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    asset_location = Column(String(255), nullable=False)
    category = Column(String(255), nullable=False)
    rent_price_index = Column(Numeric(18, 4), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class EntityAdjustmentFactor(Base):
    __tablename__ = "entity_adjustment_factors"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    entity_type = Column(String(255), nullable=False)
    category = Column(String(255), nullable=False)
    percentage = Column(Numeric(10, 4), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class LocationAdjustmentFactor(Base):
    __tablename__ = "location_adjustment_factors"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    location = Column(String(255), nullable=False)
    percentage = Column(Numeric(10, 4), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class PeriodAdjustmentFactor(Base):
    __tablename__ = "period_adjustment_factors"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    period_duration = Column(String(255), nullable=False)
    min_year = Column(Integer, nullable=False, default=1)
    max_year = Column(Integer, nullable=False, default=5)
    percentage = Column(Numeric(10, 4), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class PaymentAdjustmentFactor(Base):
    __tablename__ = "payment_adjustment_factors"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    lease_term = Column(String(255), nullable=False)
    rate = Column(Numeric(10, 4), nullable=False)
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Tax(Base):
    __tablename__ = "taxes"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    rate = Column(Numeric(10, 4), nullable=False)
    coverage = Column(Numeric(10, 4), nullable=False)
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class MarginFee(Base):
    __tablename__ = "margin_fees"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    rate = Column(Numeric(10, 4), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
