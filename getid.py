import os
from dotenv import load_dotenv
from googleapiclient.discovery import build

# Load variables from .env
load_dotenv()

# Get API key from environment
api_key = os.getenv("YOUTUBE_API_KEY")

# Initialize YouTube API client
youtube = build("youtube", "v3", developerKey=api_key)

def get_channel_id(channel_name):
    request = youtube.search().list(
        part="snippet",
        q=channel_name,
        type="channel",
        maxResults=1
    )
    response = request.execute()
    if response["items"]:
        return response["items"][0]["snippet"]["channelId"]
    else:
        return None

# Example usage
print(get_channel_id("7clouds"))

