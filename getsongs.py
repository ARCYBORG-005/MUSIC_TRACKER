import os
from datetime import datetime, timedelta, timezone
from googleapiclient.discovery import build
from supabase import create_client
from dotenv import load_dotenv

# Load secrets from .env
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # use service role key
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# Init clients
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)

# channel_id -> artist name
artists = {
    "UCNqFDjYTexJDET3rPDrmJKg": "7clouds",  # real 7clouds channel id
    # add more like: "UCxxxx": "Artist Name"
}

def fetch_recent_videos(channel_id: str, artist_name: str, published_after_iso: str):
    """Return list of dicts with only columns your table accepts."""
    req = youtube.search().list(
        part="snippet",
        channelId=channel_id,
        order="date",
        type="video",
        publishedAfter=published_after_iso,
        maxResults=10
    )
    res = req.execute()

    songs = []
    for item in res.get("items", []):
        vid = item["id"].get("videoId")
        if not vid:
            continue
        title = item["snippet"]["title"]
        published_at = item["snippet"]["publishedAt"]  # RFC3339 string (UTC)
        url = f"https://youtu.be/{vid}"

        songs.append({
            "title": title,
            "url": url,
            "artist": artist_name,
            "published": published_at,   # matches timestamptz column
        })
    return songs

def main():
    # last 48 hours (UTC), timezone-aware (no deprecation warning)
    published_after = (datetime.now(timezone.utc) - timedelta(days=2))
    published_after_iso = published_after.isoformat(timespec="seconds")  # e.g. 2025-08-16T00:00:00+00:00

    all_rows = []
    for channel_id, artist in artists.items():
        rows = fetch_recent_videos(channel_id, artist, published_after_iso)
        if rows:
            print(f"✅ Fetched {len(rows)} videos for {artist}")
            all_rows.extend(rows)
        else:
            print(f"⚠️ No videos found for {artist} in last 48 hours")

    if not all_rows:
        print("⚠️ No songs to insert. Supabase not updated.")
        return

    try:
        # Clear old data
        supabase.table("song").delete().neq("id", 0).execute()
        # Insert ONLY the columns your table has
        resp = supabase.table("song").insert(all_rows).execute()
        print("🎵 Inserted rows:", len(all_rows))
    except Exception as e:
        print("❌ Supabase error:", e)

if __name__ == "__main__":
    main()
