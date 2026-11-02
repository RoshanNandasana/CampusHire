import time
from collections import defaultdict

ATTEMPTS = defaultdict(list)

MAX_ATTEMPTS = 5
WINDOW = 900


def allow_login(ip: str):

    now = time.time()

    ATTEMPTS[ip] = [
        t for t in ATTEMPTS[ip]
        if now - t < WINDOW
    ]

    if len(ATTEMPTS[ip]) >= MAX_ATTEMPTS:
        return False

    ATTEMPTS[ip].append(now)

    return True