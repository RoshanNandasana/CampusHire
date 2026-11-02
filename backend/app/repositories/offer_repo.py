from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.offers import Offer
from app.models.offer_history import OfferHistory


async def get_offer_by_id(db: AsyncSession, offer_id) -> Offer | None:
    result = await db.execute(select(Offer).where(Offer.id == offer_id))
    return result.scalar_one_or_none()


async def override_offer_status(db: AsyncSession, offer_id,
                                 new_status: str, reason: str,
                                 admin_user_id) -> Offer | None:
    offer = await get_offer_by_id(db, offer_id)
    if not offer:
        return None

    old_status = offer.status
    offer.status = new_status

    # Record to history
    history = OfferHistory(
        offer_id=offer.id,
        changed_by=admin_user_id,
        old_status=old_status,
        new_status=new_status,
        reason=reason,
    )
    db.add(history)
    await db.commit()
    await db.refresh(offer)
    return offer
