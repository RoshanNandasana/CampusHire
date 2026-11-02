"""
PASETO v4 local (symmetric) token helpers.
Uses python-paseto 0.5.2 with encrypt/decrypt from paseto.protocol.version4.
"""
import datetime
import hashlib
import json
import os

from paseto.protocol.version4 import decrypt, encrypt
from paseto.paserk.keys import _create_symmetric_key


_SECRET_KEY_STR = os.getenv("PASETO_SECRET_KEY", "CHANGE_THIS_SECRET")
# Derive a 32-byte symmetric key from the configured secret
_RAW_KEY = hashlib.sha256(_SECRET_KEY_STR.encode()).digest()
_SYM_KEY = _create_symmetric_key(4, _RAW_KEY)

ACCESS_EXP = 30    # minutes
REFRESH_EXP = 7    # days


def _make_token(claims: dict) -> str:
    token_bytes = encrypt(json.dumps(claims).encode(), _SYM_KEY)
    return token_bytes.decode()


def _parse_token(token: str) -> dict:
    plaintext = decrypt(token.encode(), _SYM_KEY)
    return json.loads(plaintext)


def create_access_token(payload: dict) -> str:
    claims = dict(payload)
    claims["type"] = "access"
    claims["exp"] = (
        datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_EXP)
    ).isoformat()
    return _make_token(claims)


def create_refresh_token(payload: dict) -> str:
    claims = dict(payload)
    claims["type"] = "refresh"
    claims["exp"] = (
        datetime.datetime.utcnow() + datetime.timedelta(days=REFRESH_EXP)
    ).isoformat()
    return _make_token(claims)


def decode_token(token: str) -> dict:
    claims = _parse_token(token)
    exp = claims.get("exp")
    if exp:
        expires_at = datetime.datetime.fromisoformat(exp)
        if expires_at <= datetime.datetime.utcnow():
            raise ValueError("Token expired")
    return claims