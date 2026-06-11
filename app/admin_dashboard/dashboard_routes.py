from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.admin_dashboard.dashboard_service import DashboardService
from app.auth.dependencies import RoleChecker, get_current_user
from app.models import UserRole, User
from app.admin_dashboard.dashboard_schema import (
    DashboardResponse,
    DashboardStatsResponse,
    RecentUserResponse, 
    RecentBookResponse,
    TopUserResponse,
    TopBookResponse,
)


router = APIRouter(
    prefix="/admin/dashboard",
    tags=["Admin Dashboard"]
)

admin_only = RoleChecker([UserRole.ADMIN])
dashboard_service = DashboardService()

@router.get("/overview",response_model=DashboardResponse)
async def get_dashboard_overview(
    db:AsyncSession=Depends(get_db),
    user:User=Depends(get_current_user),
    role_checker=Depends(admin_only)
):
    return await dashboard_service.get_dashboard_overview(db)

@router.get("/stats",response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    db:AsyncSession=Depends(get_db),
    user:User=Depends(get_current_user),
    role_checker=Depends(admin_only)
):
    return await dashboard_service.get_dashboard(db)

@router.get("/recent-users",response_model=list[RecentUserResponse])
async def get_recent_users(
    db:AsyncSession=Depends(get_db),
    user:User=Depends(get_current_user),
    role_checker=Depends(admin_only)
):
    return await dashboard_service.get_recent_users(db)

@router.get("/recent-books",response_model=list[RecentBookResponse])
async def get_recent_books(
    db:AsyncSession=Depends(get_db),
    user:User=Depends(get_current_user),
    role_checker=Depends(admin_only)
):
    return await dashboard_service.get_recent_books(db)

@router.get("/top-users",response_model=list[TopUserResponse])
async def get_top_users(
    db:AsyncSession=Depends(get_db),
    user:User=Depends(get_current_user),
    role_checker=Depends(admin_only)
):
    return await dashboard_service.get_top_users(db)

@router.get("/top-books",response_model=list[TopBookResponse])
async def get_top_books(
    db:AsyncSession=Depends(get_db),
    user:User=Depends(get_current_user),
    role_checker=Depends(admin_only)
):
    return await dashboard_service.get_top_books(db)
