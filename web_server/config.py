from dotenv import load_dotenv
import os

load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST") or "no redis"
REDIS_PORT = os.getenv("REDIS_PORT") or "no port!"
RABBIT_HOST = os.getenv("RABBIT_HOST") or "no rabbit!!"
