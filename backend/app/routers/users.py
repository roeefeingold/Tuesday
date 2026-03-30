from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user, require_admin
from app.models.user import User
from app.schemas.user import UserOut

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=list[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()


@router.get("/pending", response_model=list[UserOut])
async def list_pending_users(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(
        select(User).where(User.is_approved == False).order_by(User.created_at.desc())
    )
    return result.scalars().all()


@router.get("/developers", response_model=list[UserOut])
async def list_developers(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(User).where(
            User.role == "developer",
            User.is_approved == True,
            User.is_active == True,
        ).order_by(User.full_name)
    )
    return result.scalars().all()


@router.patch("/{user_id}/approve", response_model=UserOut)
async def approve_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_approved = True
    await db.flush()
    await db.refresh(user)
    return user


@router.patch("/{user_id}/role", response_model=UserOut)
async def change_role(
    user_id: UUID,
    body: dict,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    role = body.get("role")
    if role not in ("admin", "developer", "reporter"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.role = role
    await db.flush()
    await db.refresh(user)
    return user


@router.patch("/{user_id}/deactivate", response_model=UserOut)
async def toggle_active(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_active = not user.is_active
    await db.flush()
    await db.refresh(user)
    return user
