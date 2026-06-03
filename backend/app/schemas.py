from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field
from typing import List

class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    sku: str = Field(..., min_length=2, max_length=80)
    price: Decimal = Field(..., ge=0)
    quantity_in_stock: int = Field(..., ge=0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=120)
    sku: str | None = Field(None, min_length=2, max_length=80)
    price: Decimal | None = Field(None, ge=0)
    quantity_in_stock: int | None = Field(None, ge=0)

class ProductOut(ProductBase):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}

class CustomerCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(..., min_length=6, max_length=30)

class CustomerOut(CustomerCreate):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(..., min_length=1)

class OrderItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    sku: str
    quantity: int
    unit_price: Decimal
    line_total: Decimal
    model_config = {"from_attributes": True}

class OrderOut(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    total_amount: Decimal
    created_at: datetime
    items: List[OrderItemOut]
    model_config = {"from_attributes": True}

class DashboardOut(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: int
