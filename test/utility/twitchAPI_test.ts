// deno-lint-ignore-file no-explicit-any
import { buildUrl, searchChannel, searchStreams, API_BASE_URL, QUERIES } from "../../src/utility/twitchAPI.ts"
import { assertEquals } from "../deps.ts"

Deno.test("buildUrl", () => {
    assertEquals(buildUrl(QUERIES.search.channel), API_BASE_URL + QUERIES.search.channel)
});

Deno.test("searchChannelEmptyName", async () => {
    const channel = await searchChannel("")
    assertEquals(channel, undefined)
});

Deno.test("searchChannelValidName", async () => {
    const channel: any = await searchChannel("Twitch")
    assertEquals(channel.display_name, "Twitch")
});

Deno.test("searchChannelInvalidName", async () => {
    const channel: any = await searchChannel("_")
    assertEquals(channel, undefined)
});

Deno.test("streamsEmptyIds", async () => {
    const streams = await searchStreams([])
    assertEquals(streams, [])
});

Deno.test("streamsInvalidIds", async () => {
    const streams = await searchStreams(["1","2","3"])
    assertEquals(streams, [])
});