from googleapiclient.discovery import build

api_key = "AIzaSyBt_L4QwjNS6_5kgqpnzekw9YVrcY5M144"
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

print(get_channel_id("7clouds"))   # should print UCN1hnUccO4FD5WfM7ithXaw

