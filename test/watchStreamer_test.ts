// deno-lint-ignore-file no-explicit-any
import { WatchStreamer } from "../src/commands/watchStreamer.ts"
import { assertEquals, assertThrows, assert } from "https://deno.land/std@0.128.0/testing/asserts.ts"

const MOCK_CLIENT: any = {}

function newWatchStreamer(): WatchStreamer {
    const watchStreamer = new WatchStreamer(MOCK_CLIENT)
    clearInterval(watchStreamer.interval)
    return watchStreamer
}
Deno.test("watchStreamerInvalidName", async () => {
    const watchStreamer = newWatchStreamer()
    let reply = ""
    const ctx: any = { message: { reply: function(text: string) { reply = text } } }
    await watchStreamer["watchStreamer"](ctx, "_")
    assertEquals(reply, "Streamer not found!")
});

Deno.test("watchStreamerValidName", async () => {
    const watchStreamer = newWatchStreamer()
    const ctx: any = { 
        message: { reply: function() { } },
        guild: { id: "1", roles: { fetchAll: function() { return [{ name: "twitch", id: "xyz", addTo: () => {} }] } } }
    }
    await watchStreamer["watchStreamer"](ctx, "twitch")
    const isCached = watchStreamer["checkStreamerCached"]("1", "twitch")
    assertEquals(isCached, true)
});

Deno.test("watchStreamerCached",  async () => {
    const watchStreamer = newWatchStreamer()
    const ctx_emptyRole: any = { 
        guild: { 
            roles: { 
                fetchAll: 
                    function() {
                        return new Promise<any>(res => { res([]) })
                    } 
            } 
        }
    }
    try {
        await watchStreamer["watchStreamerCached"](ctx_emptyRole, "epicStreamer")
    } catch (error) {
        assertThrows(error, Error)
    }

    let messageAuthor = ""
    const ctx_withRole: any = { 
        guild: { 
            roles: { 
                fetchAll: 
                    function() {
                        return new Promise<any>(res => { res([ { name: "epicStreamer", addTo: function(usr: string) { messageAuthor = usr } } ]) })
                    } 
            } 
        },
        message: {
            author: "epicDiscordUser",
            reply: function() {}
        }
    }
    await watchStreamer["watchStreamerCached"](ctx_withRole, "epicStreamer")
    assertEquals(messageAuthor, "epicDiscordUser")
});

Deno.test("addToCache", () => {
    const watchStreamer = newWatchStreamer()
    watchStreamer["addToCache"]("realGuildId", "epicStreamer", "iAmEpicStreamersId","123abc")
    assert("realGuildId" in watchStreamer.cache)
    assert("epicStreamer" in watchStreamer.cache["realGuildId"])
    assertEquals(watchStreamer.cache["realGuildId"]["epicStreamer"].streamerId, "iAmEpicStreamersId")
    assertEquals(watchStreamer.cache["realGuildId"]["epicStreamer"].roleId, "123abc")
    assertEquals(watchStreamer.cache["realGuildId"]["epicStreamer"].is_live, false)
    assert(watchStreamer.cache["realGuildId"]["epicStreamer"].nextCheck <= Date.now())
});

Deno.test("checkStreamerCached", () => {
    const watchStreamer = newWatchStreamer()
    assertEquals(watchStreamer["checkStreamerCached"]("abc", "abc"), false)

    watchStreamer["addToCache"]("realGuildId", "epicStreamer", "iAmEpicStreamersId","123abc")
    assertEquals(watchStreamer["checkStreamerCached"]("realGuildId", "epicStreamer"), true)
});

Deno.test("isGuildCached", () => {
    const watchStreamer = newWatchStreamer()
    assertEquals(watchStreamer["isGuildCached"]("abc"), false)
    
    watchStreamer["cache"] = { "realGuildId": {} }
    assertEquals(watchStreamer["isGuildCached"]("realGuildId"), true)
});