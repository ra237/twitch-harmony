import { soxa } from "../../deps.ts"
import type { TwitchChannel } from "../types/twitchChannel.ts"
import type { TwitchStream } from "../types/twitchStream.ts"

const TWITCH_CLIENT_ID = Deno.env.get("TWITCH_CLIENT_ID")
const TWITCH_AUTH_TOKEN = Deno.env.get("TWITCH_AUTH_TOKEN")

export const API_BASE_URL = "https://api.twitch.tv/helix/"
export const QUERIES = {
    search: {
        channel: "search/channels?query="
    },
    streams: "streams?user_id="
}
const HEADERS = { 
    headers: { 
        "Authorization": "Bearer " + TWITCH_AUTH_TOKEN,
        "Client-Id": TWITCH_CLIENT_ID
    } 
}

export function buildUrl(uri: string): string {
    return API_BASE_URL + uri
}

export async function searchChannel(streamerName: string): Promise<TwitchChannel | undefined> {
    if(streamerName === "") {
        return undefined
    }
    const queryUrl = buildUrl(QUERIES.search.channel)
    const req = await soxa.get(queryUrl + streamerName + "&first=100", HEADERS)
    const data: TwitchChannel[] = req.data.data
    for(const channel of data) {
        if(channel.display_name.toLowerCase() === streamerName.toLowerCase()) {
            return channel
        }
    }
    return undefined
}

export async function searchStreams(user_ids: string[]): Promise<TwitchStream[]> {
    if(user_ids.length === 0) {
        return []
    }
    let queryUrl = buildUrl(QUERIES.streams)
    for(let i = 0; i < user_ids.length; i++) {
        if(i === user_ids.length - 1) {
            queryUrl += user_ids[i]
        } else {
            queryUrl += `${user_ids[i]}&user_id=`
        }
    }
    const req = await soxa.get(queryUrl, HEADERS)
    const data: TwitchStream[] = req.data.data
    return data
}