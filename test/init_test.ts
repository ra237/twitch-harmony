import { soxa } from "../deps.ts";
import { assert, assertEquals  } from "./deps.ts"

const TWITCH_CLIENT_ID = Deno.env.get("TWITCH_CLIENT_ID")
const TWITCH_AUTH_TOKEN = Deno.env.get("TWITCH_AUTH_TOKEN")
const API_BASE_URL = "https://api.twitch.tv/helix/"

Deno.test("check if env variables are loaded correctly", () => {
    assert(typeof TWITCH_CLIENT_ID === 'string', `TWITCH_CLIENT_ID type is ${typeof TWITCH_CLIENT_ID} instead of string.`)
    assert(typeof TWITCH_AUTH_TOKEN === 'string', `TWITCH_AUTH_TOKEN type is ${typeof TWITCH_AUTH_TOKEN} instead of string.`)
});

Deno.test("check API access", async (): Promise<void> => {  
    const url = API_BASE_URL + "search/channels?query=x";
    const headers = { headers: { "Authorization": "Bearer " + TWITCH_AUTH_TOKEN, "Client-Id": TWITCH_CLIENT_ID } }
    const req = await soxa.get(url, headers)
    assertEquals(req.status, 200)
});
