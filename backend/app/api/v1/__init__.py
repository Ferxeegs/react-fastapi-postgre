"""
API v1 routes.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    roles,
    settings,
    media,
    hpp_admin,
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(roles.router, prefix="/roles", tags=["Roles"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
api_router.include_router(media.router, prefix="/media", tags=["Media"])
api_router.include_router(hpp_admin.router, prefix="/hpp/admin", tags=["HPP Admin"])

