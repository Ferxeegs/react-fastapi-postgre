"""
HPP admin master data CRUD endpoints.
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.exceptions import NotFoundException
from app.models.hpp_master import (
    EntityAdjustmentFactor,
    FairBuildingValue,
    FairLandValue,
    LocationAdjustmentFactor,
    MarginFee,
    PaymentAdjustmentFactor,
    PeriodAdjustmentFactor,
    RentVariable,
    Tax,
)
from app.schemas.common import WebResponse
from app.schemas.hpp_master import (
    EntityAdjustmentFactorCreate,
    EntityAdjustmentFactorRead,
    EntityAdjustmentFactorUpdate,
    FairBuildingValueCreate,
    FairBuildingValueRead,
    FairBuildingValueUpdate,
    FairLandValueCreate,
    FairLandValueRead,
    FairLandValueUpdate,
    LocationAdjustmentFactorCreate,
    LocationAdjustmentFactorRead,
    LocationAdjustmentFactorUpdate,
    MarginFeeCreate,
    MarginFeeRead,
    MarginFeeUpdate,
    PaymentAdjustmentFactorCreate,
    PaymentAdjustmentFactorRead,
    PaymentAdjustmentFactorUpdate,
    PeriodAdjustmentFactorCreate,
    PeriodAdjustmentFactorRead,
    PeriodAdjustmentFactorUpdate,
    RentVariableCreate,
    RentVariableRead,
    RentVariableUpdate,
    TaxCreate,
    TaxRead,
    TaxUpdate,
)

router = APIRouter()


@router.get("/rent-variables", response_model=WebResponse[list[RentVariableRead]])
def get_rent_variables(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    items = db.query(RentVariable).order_by(RentVariable.id.asc()).offset(skip).limit(limit).all()
    return WebResponse(status="success", data=[RentVariableRead.model_validate(item) for item in items])


@router.get("/rent-variables/{item_id}", response_model=WebResponse[RentVariableRead])
def get_rent_variable(item_id: int, db: Session = Depends(get_db)):
    item = db.query(RentVariable).filter(RentVariable.id == item_id).first()
    if not item:
        raise NotFoundException(f"Rent variable with ID {item_id} not found")
    return WebResponse(status="success", data=RentVariableRead.model_validate(item))


@router.post("/rent-variables", response_model=WebResponse[RentVariableRead], status_code=status.HTTP_201_CREATED)
def create_rent_variable(payload: RentVariableCreate, db: Session = Depends(get_db)):
    item = RentVariable(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return WebResponse(status="success", message="Rent variable created successfully", data=RentVariableRead.model_validate(item))


@router.put("/rent-variables/{item_id}", response_model=WebResponse[RentVariableRead])
def update_rent_variable(item_id: int, payload: RentVariableUpdate, db: Session = Depends(get_db)):
    item = db.query(RentVariable).filter(RentVariable.id == item_id).first()
    if not item:
        raise NotFoundException(f"Rent variable with ID {item_id} not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return WebResponse(status="success", message="Rent variable updated successfully", data=RentVariableRead.model_validate(item))


@router.delete("/rent-variables/{item_id}", response_model=WebResponse[None])
def delete_rent_variable(item_id: int, db: Session = Depends(get_db)):
    item = db.query(RentVariable).filter(RentVariable.id == item_id).first()
    if not item:
        raise NotFoundException(f"Rent variable with ID {item_id} not found")
    db.delete(item)
    db.commit()
    return WebResponse(status="success", message="Rent variable deleted successfully")


@router.get("/fair-land-values", response_model=WebResponse[list[FairLandValueRead]])
def get_fair_land_values(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    items = db.query(FairLandValue).order_by(FairLandValue.id.asc()).offset(skip).limit(limit).all()
    return WebResponse(status="success", data=[FairLandValueRead.model_validate(item) for item in items])


@router.get("/fair-land-values/{item_id}", response_model=WebResponse[FairLandValueRead])
def get_fair_land_value(item_id: int, db: Session = Depends(get_db)):
    item = db.query(FairLandValue).filter(FairLandValue.id == item_id).first()
    if not item:
        raise NotFoundException(f"Fair land value with ID {item_id} not found")
    return WebResponse(status="success", data=FairLandValueRead.model_validate(item))


@router.post("/fair-land-values", response_model=WebResponse[FairLandValueRead], status_code=status.HTTP_201_CREATED)
def create_fair_land_value(payload: FairLandValueCreate, db: Session = Depends(get_db)):
    item = FairLandValue(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return WebResponse(status="success", message="Fair land value created successfully", data=FairLandValueRead.model_validate(item))


@router.put("/fair-land-values/{item_id}", response_model=WebResponse[FairLandValueRead])
def update_fair_land_value(item_id: int, payload: FairLandValueUpdate, db: Session = Depends(get_db)):
    item = db.query(FairLandValue).filter(FairLandValue.id == item_id).first()
    if not item:
        raise NotFoundException(f"Fair land value with ID {item_id} not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return WebResponse(status="success", message="Fair land value updated successfully", data=FairLandValueRead.model_validate(item))


@router.delete("/fair-land-values/{item_id}", response_model=WebResponse[None])
def delete_fair_land_value(item_id: int, db: Session = Depends(get_db)):
    item = db.query(FairLandValue).filter(FairLandValue.id == item_id).first()
    if not item:
        raise NotFoundException(f"Fair land value with ID {item_id} not found")
    db.delete(item)
    db.commit()
    return WebResponse(status="success", message="Fair land value deleted successfully")


@router.get("/fair-building-values", response_model=WebResponse[list[FairBuildingValueRead]])
def get_fair_building_values(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    items = db.query(FairBuildingValue).order_by(FairBuildingValue.id.asc()).offset(skip).limit(limit).all()
    return WebResponse(status="success", data=[FairBuildingValueRead.model_validate(item) for item in items])


@router.get("/fair-building-values/{item_id}", response_model=WebResponse[FairBuildingValueRead])
def get_fair_building_value(item_id: int, db: Session = Depends(get_db)):
    item = db.query(FairBuildingValue).filter(FairBuildingValue.id == item_id).first()
    if not item:
        raise NotFoundException(f"Fair building value with ID {item_id} not found")
    return WebResponse(status="success", data=FairBuildingValueRead.model_validate(item))


@router.post("/fair-building-values", response_model=WebResponse[FairBuildingValueRead], status_code=status.HTTP_201_CREATED)
def create_fair_building_value(payload: FairBuildingValueCreate, db: Session = Depends(get_db)):
    item = FairBuildingValue(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return WebResponse(status="success", message="Fair building value created successfully", data=FairBuildingValueRead.model_validate(item))


@router.put("/fair-building-values/{item_id}", response_model=WebResponse[FairBuildingValueRead])
def update_fair_building_value(item_id: int, payload: FairBuildingValueUpdate, db: Session = Depends(get_db)):
    item = db.query(FairBuildingValue).filter(FairBuildingValue.id == item_id).first()
    if not item:
        raise NotFoundException(f"Fair building value with ID {item_id} not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return WebResponse(status="success", message="Fair building value updated successfully", data=FairBuildingValueRead.model_validate(item))


@router.delete("/fair-building-values/{item_id}", response_model=WebResponse[None])
def delete_fair_building_value(item_id: int, db: Session = Depends(get_db)):
    item = db.query(FairBuildingValue).filter(FairBuildingValue.id == item_id).first()
    if not item:
        raise NotFoundException(f"Fair building value with ID {item_id} not found")
    db.delete(item)
    db.commit()
    return WebResponse(status="success", message="Fair building value deleted successfully")


@router.get("/entity-adjustment-factors", response_model=WebResponse[list[EntityAdjustmentFactorRead]])
def get_entity_adjustment_factors(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    items = db.query(EntityAdjustmentFactor).order_by(EntityAdjustmentFactor.id.asc()).offset(skip).limit(limit).all()
    return WebResponse(status="success", data=[EntityAdjustmentFactorRead.model_validate(item) for item in items])


@router.get("/entity-adjustment-factors/{item_id}", response_model=WebResponse[EntityAdjustmentFactorRead])
def get_entity_adjustment_factor(item_id: int, db: Session = Depends(get_db)):
    item = db.query(EntityAdjustmentFactor).filter(EntityAdjustmentFactor.id == item_id).first()
    if not item:
        raise NotFoundException(f"Entity adjustment factor with ID {item_id} not found")
    return WebResponse(status="success", data=EntityAdjustmentFactorRead.model_validate(item))


@router.post(
    "/entity-adjustment-factors",
    response_model=WebResponse[EntityAdjustmentFactorRead],
    status_code=status.HTTP_201_CREATED,
)
def create_entity_adjustment_factor(payload: EntityAdjustmentFactorCreate, db: Session = Depends(get_db)):
    item = EntityAdjustmentFactor(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return WebResponse(
        status="success",
        message="Entity adjustment factor created successfully",
        data=EntityAdjustmentFactorRead.model_validate(item),
    )


@router.put("/entity-adjustment-factors/{item_id}", response_model=WebResponse[EntityAdjustmentFactorRead])
def update_entity_adjustment_factor(item_id: int, payload: EntityAdjustmentFactorUpdate, db: Session = Depends(get_db)):
    item = db.query(EntityAdjustmentFactor).filter(EntityAdjustmentFactor.id == item_id).first()
    if not item:
        raise NotFoundException(f"Entity adjustment factor with ID {item_id} not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return WebResponse(
        status="success",
        message="Entity adjustment factor updated successfully",
        data=EntityAdjustmentFactorRead.model_validate(item),
    )


@router.delete("/entity-adjustment-factors/{item_id}", response_model=WebResponse[None])
def delete_entity_adjustment_factor(item_id: int, db: Session = Depends(get_db)):
    item = db.query(EntityAdjustmentFactor).filter(EntityAdjustmentFactor.id == item_id).first()
    if not item:
        raise NotFoundException(f"Entity adjustment factor with ID {item_id} not found")
    db.delete(item)
    db.commit()
    return WebResponse(status="success", message="Entity adjustment factor deleted successfully")


@router.get("/location-adjustment-factors", response_model=WebResponse[list[LocationAdjustmentFactorRead]])
def get_location_adjustment_factors(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    items = db.query(LocationAdjustmentFactor).order_by(LocationAdjustmentFactor.id.asc()).offset(skip).limit(limit).all()
    return WebResponse(status="success", data=[LocationAdjustmentFactorRead.model_validate(item) for item in items])


@router.get("/location-adjustment-factors/{item_id}", response_model=WebResponse[LocationAdjustmentFactorRead])
def get_location_adjustment_factor(item_id: int, db: Session = Depends(get_db)):
    item = db.query(LocationAdjustmentFactor).filter(LocationAdjustmentFactor.id == item_id).first()
    if not item:
        raise NotFoundException(f"Location adjustment factor with ID {item_id} not found")
    return WebResponse(status="success", data=LocationAdjustmentFactorRead.model_validate(item))


@router.post(
    "/location-adjustment-factors",
    response_model=WebResponse[LocationAdjustmentFactorRead],
    status_code=status.HTTP_201_CREATED,
)
def create_location_adjustment_factor(payload: LocationAdjustmentFactorCreate, db: Session = Depends(get_db)):
    item = LocationAdjustmentFactor(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return WebResponse(
        status="success",
        message="Location adjustment factor created successfully",
        data=LocationAdjustmentFactorRead.model_validate(item),
    )


@router.put("/location-adjustment-factors/{item_id}", response_model=WebResponse[LocationAdjustmentFactorRead])
def update_location_adjustment_factor(item_id: int, payload: LocationAdjustmentFactorUpdate, db: Session = Depends(get_db)):
    item = db.query(LocationAdjustmentFactor).filter(LocationAdjustmentFactor.id == item_id).first()
    if not item:
        raise NotFoundException(f"Location adjustment factor with ID {item_id} not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return WebResponse(
        status="success",
        message="Location adjustment factor updated successfully",
        data=LocationAdjustmentFactorRead.model_validate(item),
    )


@router.delete("/location-adjustment-factors/{item_id}", response_model=WebResponse[None])
def delete_location_adjustment_factor(item_id: int, db: Session = Depends(get_db)):
    item = db.query(LocationAdjustmentFactor).filter(LocationAdjustmentFactor.id == item_id).first()
    if not item:
        raise NotFoundException(f"Location adjustment factor with ID {item_id} not found")
    db.delete(item)
    db.commit()
    return WebResponse(status="success", message="Location adjustment factor deleted successfully")


@router.get("/period-adjustment-factors", response_model=WebResponse[list[PeriodAdjustmentFactorRead]])
def get_period_adjustment_factors(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    items = db.query(PeriodAdjustmentFactor).order_by(PeriodAdjustmentFactor.id.asc()).offset(skip).limit(limit).all()
    return WebResponse(status="success", data=[PeriodAdjustmentFactorRead.model_validate(item) for item in items])


@router.get("/period-adjustment-factors/{item_id}", response_model=WebResponse[PeriodAdjustmentFactorRead])
def get_period_adjustment_factor(item_id: int, db: Session = Depends(get_db)):
    item = db.query(PeriodAdjustmentFactor).filter(PeriodAdjustmentFactor.id == item_id).first()
    if not item:
        raise NotFoundException(f"Period adjustment factor with ID {item_id} not found")
    return WebResponse(status="success", data=PeriodAdjustmentFactorRead.model_validate(item))


@router.post(
    "/period-adjustment-factors",
    response_model=WebResponse[PeriodAdjustmentFactorRead],
    status_code=status.HTTP_201_CREATED,
)
def create_period_adjustment_factor(payload: PeriodAdjustmentFactorCreate, db: Session = Depends(get_db)):
    item = PeriodAdjustmentFactor(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return WebResponse(
        status="success",
        message="Period adjustment factor created successfully",
        data=PeriodAdjustmentFactorRead.model_validate(item),
    )


@router.put("/period-adjustment-factors/{item_id}", response_model=WebResponse[PeriodAdjustmentFactorRead])
def update_period_adjustment_factor(item_id: int, payload: PeriodAdjustmentFactorUpdate, db: Session = Depends(get_db)):
    item = db.query(PeriodAdjustmentFactor).filter(PeriodAdjustmentFactor.id == item_id).first()
    if not item:
        raise NotFoundException(f"Period adjustment factor with ID {item_id} not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return WebResponse(
        status="success",
        message="Period adjustment factor updated successfully",
        data=PeriodAdjustmentFactorRead.model_validate(item),
    )


@router.delete("/period-adjustment-factors/{item_id}", response_model=WebResponse[None])
def delete_period_adjustment_factor(item_id: int, db: Session = Depends(get_db)):
    item = db.query(PeriodAdjustmentFactor).filter(PeriodAdjustmentFactor.id == item_id).first()
    if not item:
        raise NotFoundException(f"Period adjustment factor with ID {item_id} not found")
    db.delete(item)
    db.commit()
    return WebResponse(status="success", message="Period adjustment factor deleted successfully")


@router.get("/payment-adjustment-factors", response_model=WebResponse[list[PaymentAdjustmentFactorRead]])
def get_payment_adjustment_factors(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    items = db.query(PaymentAdjustmentFactor).order_by(PaymentAdjustmentFactor.id.asc()).offset(skip).limit(limit).all()
    return WebResponse(status="success", data=[PaymentAdjustmentFactorRead.model_validate(item) for item in items])


@router.get("/payment-adjustment-factors/{item_id}", response_model=WebResponse[PaymentAdjustmentFactorRead])
def get_payment_adjustment_factor(item_id: int, db: Session = Depends(get_db)):
    item = db.query(PaymentAdjustmentFactor).filter(PaymentAdjustmentFactor.id == item_id).first()
    if not item:
        raise NotFoundException(f"Payment adjustment factor with ID {item_id} not found")
    return WebResponse(status="success", data=PaymentAdjustmentFactorRead.model_validate(item))


@router.post(
    "/payment-adjustment-factors",
    response_model=WebResponse[PaymentAdjustmentFactorRead],
    status_code=status.HTTP_201_CREATED,
)
def create_payment_adjustment_factor(payload: PaymentAdjustmentFactorCreate, db: Session = Depends(get_db)):
    item = PaymentAdjustmentFactor(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return WebResponse(
        status="success",
        message="Payment adjustment factor created successfully",
        data=PaymentAdjustmentFactorRead.model_validate(item),
    )


@router.put("/payment-adjustment-factors/{item_id}", response_model=WebResponse[PaymentAdjustmentFactorRead])
def update_payment_adjustment_factor(item_id: int, payload: PaymentAdjustmentFactorUpdate, db: Session = Depends(get_db)):
    item = db.query(PaymentAdjustmentFactor).filter(PaymentAdjustmentFactor.id == item_id).first()
    if not item:
        raise NotFoundException(f"Payment adjustment factor with ID {item_id} not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return WebResponse(
        status="success",
        message="Payment adjustment factor updated successfully",
        data=PaymentAdjustmentFactorRead.model_validate(item),
    )


@router.delete("/payment-adjustment-factors/{item_id}", response_model=WebResponse[None])
def delete_payment_adjustment_factor(item_id: int, db: Session = Depends(get_db)):
    item = db.query(PaymentAdjustmentFactor).filter(PaymentAdjustmentFactor.id == item_id).first()
    if not item:
        raise NotFoundException(f"Payment adjustment factor with ID {item_id} not found")
    db.delete(item)
    db.commit()
    return WebResponse(status="success", message="Payment adjustment factor deleted successfully")


@router.get("/taxes", response_model=WebResponse[list[TaxRead]])
def get_taxes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    items = db.query(Tax).order_by(Tax.id.asc()).offset(skip).limit(limit).all()
    return WebResponse(status="success", data=[TaxRead.model_validate(item) for item in items])


@router.get("/taxes/{item_id}", response_model=WebResponse[TaxRead])
def get_tax(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Tax).filter(Tax.id == item_id).first()
    if not item:
        raise NotFoundException(f"Tax with ID {item_id} not found")
    return WebResponse(status="success", data=TaxRead.model_validate(item))


@router.post("/taxes", response_model=WebResponse[TaxRead], status_code=status.HTTP_201_CREATED)
def create_tax(payload: TaxCreate, db: Session = Depends(get_db)):
    item = Tax(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return WebResponse(status="success", message="Tax created successfully", data=TaxRead.model_validate(item))


@router.put("/taxes/{item_id}", response_model=WebResponse[TaxRead])
def update_tax(item_id: int, payload: TaxUpdate, db: Session = Depends(get_db)):
    item = db.query(Tax).filter(Tax.id == item_id).first()
    if not item:
        raise NotFoundException(f"Tax with ID {item_id} not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return WebResponse(status="success", message="Tax updated successfully", data=TaxRead.model_validate(item))


@router.delete("/taxes/{item_id}", response_model=WebResponse[None])
def delete_tax(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Tax).filter(Tax.id == item_id).first()
    if not item:
        raise NotFoundException(f"Tax with ID {item_id} not found")
    db.delete(item)
    db.commit()
    return WebResponse(status="success", message="Tax deleted successfully")


@router.get("/margin-fees", response_model=WebResponse[list[MarginFeeRead]])
def get_margin_fees(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    items = db.query(MarginFee).order_by(MarginFee.id.asc()).offset(skip).limit(limit).all()
    return WebResponse(status="success", data=[MarginFeeRead.model_validate(item) for item in items])


@router.get("/margin-fees/{item_id}", response_model=WebResponse[MarginFeeRead])
def get_margin_fee(item_id: int, db: Session = Depends(get_db)):
    item = db.query(MarginFee).filter(MarginFee.id == item_id).first()
    if not item:
        raise NotFoundException(f"Margin fee with ID {item_id} not found")
    return WebResponse(status="success", data=MarginFeeRead.model_validate(item))


@router.post("/margin-fees", response_model=WebResponse[MarginFeeRead], status_code=status.HTTP_201_CREATED)
def create_margin_fee(payload: MarginFeeCreate, db: Session = Depends(get_db)):
    item = MarginFee(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return WebResponse(status="success", message="Margin fee created successfully", data=MarginFeeRead.model_validate(item))


@router.put("/margin-fees/{item_id}", response_model=WebResponse[MarginFeeRead])
def update_margin_fee(item_id: int, payload: MarginFeeUpdate, db: Session = Depends(get_db)):
    item = db.query(MarginFee).filter(MarginFee.id == item_id).first()
    if not item:
        raise NotFoundException(f"Margin fee with ID {item_id} not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return WebResponse(status="success", message="Margin fee updated successfully", data=MarginFeeRead.model_validate(item))


@router.delete("/margin-fees/{item_id}", response_model=WebResponse[None])
def delete_margin_fee(item_id: int, db: Session = Depends(get_db)):
    item = db.query(MarginFee).filter(MarginFee.id == item_id).first()
    if not item:
        raise NotFoundException(f"Margin fee with ID {item_id} not found")
    db.delete(item)
    db.commit()
    return WebResponse(status="success", message="Margin fee deleted successfully")
