// deno-lint-ignore-file no-explicit-any
import { WatchStreamer } from "../src/commands/watchStreamer.ts"
import { assertEquals, assertThrows, assert, Collection } from "./deps.ts"
import { getDateInSeconds } from "../src/utility/util.ts"

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

Deno.test("watchStreamerNoRole", async () => {
    const watchStreamer = newWatchStreamer()
    const ctx: any = { 
        message: { reply: function() { }, author: { username: "foo" } },
        guild: {    id: "1", 
                    roles: { fetchAll: function() { return undefined } },
                    createRole: function() { return { id: "role1", addTo: () => {} } }
        }
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

Deno.test("addToGuildNotCached", () => {
    const watchStreamer = newWatchStreamer()
    watchStreamer["addToCache"]("realGuildId", "epicStreamer", "iAmEpicStreamersId","123abc")
    assert("realGuildId" in watchStreamer.cache)
    assert("epicStreamer" in watchStreamer.cache["realGuildId"])
    assertEquals(watchStreamer.cache["realGuildId"]["epicStreamer"].streamerId, "iAmEpicStreamersId")
    assertEquals(watchStreamer.cache["realGuildId"]["epicStreamer"].roleId, "123abc")
    assertEquals(watchStreamer.cache["realGuildId"]["epicStreamer"].is_live, false)
    assert(watchStreamer.cache["realGuildId"]["epicStreamer"].nextCheck <= Date.now())
});

Deno.test("addToGuildCached", () => {
    const watchStreamer = newWatchStreamer()
    watchStreamer.cache = { "realGuildId": {} }
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

Deno.test("onMissingArgs", () => {
    const watchStreamer = newWatchStreamer()
    let message = ""
    const ctx: any = { message: { reply: function(text: string) { message = text} } }
    watchStreamer.onMissingArgs(ctx)
    assertEquals(message, watchStreamer.usage)
});

Deno.test("executeStreamerNotCached", async () => {
    const watchStreamer = newWatchStreamer()
    const ctx: any = { 
        message: { reply: () => {} },
        rawArgs: ["twitch"],
        guild: { id: "1", roles: { fetchAll: function() { return [{ name: "twitch", id: "xyz", addTo: () => {} }] } } }
    }
    await watchStreamer.execute(ctx)
    assert("twitch" in watchStreamer.cache["1"])
});

Deno.test("executeStreamerCached", async () => {
    const watchStreamer = newWatchStreamer()
    let messageAuthor = ""
    watchStreamer["addToCache"]("1", "twitch", "iAmEpicStreamersId","123abc")
    const ctx: any = { 
        guild: { 
            id: "1",
            roles: { 
                fetchAll: 
                    function() {
                        return new Promise<any>(res => { res([ { name: "twitch", id: "role1", addTo: function(usr: string) { messageAuthor = usr } } ]) })
                    } 
            }
        },
        message: {
            author: "epicDiscordUser",
            reply: function() {}
        },
        rawArgs: ["twitch"],
    }
    await watchStreamer.execute(ctx)
    assertEquals(messageAuthor, "epicDiscordUser")
});

Deno.test("isStreamerLiveNotLive", async () => {
    const watchStreamer = newWatchStreamer()
    watchStreamer["addToCache"]("1", "_", "AYAYA","xyz")
    watchStreamer.cache["1"]["_"].nextCheck = 0    
    await watchStreamer["isStreamerLive"]()
    assertEquals(watchStreamer.cache["1"]["_"].is_live, false)
    assert(watchStreamer.cache["1"]["_"].nextCheck > getDateInSeconds())
});

Deno.test("isStreamerLiveIsLive", async () => {
    const watchStreamer = newWatchStreamer()
    watchStreamer["addToCache"]("1", "user_name", "AYAYA2","xyz2")
    watchStreamer["addToCache"]("1", "livestreamer", "AYAYA2","xyz2")
    watchStreamer.cache["1"]["user_name"].nextCheck = 0
    watchStreamer.cache["1"]["livestreamer"].nextCheck = 0
    watchStreamer.cache["1"]["livestreamer"].is_live = true
    let messageSent = false
    const channelPayload: any = { name: "se-bot", isText: () => true, send: () => messageSent = true }
    const client: any = { guilds: 
        { 
            collection: function() { 
                return Collection.fromObject({ "1": 
                                                { channels: 
                                                    { array: function() { return [channelPayload] } } 
                                                } 
                                            }) 
            }
        } 
    }
    watchStreamer["searchStreams"] = (): any => { return [{ user_name: "user_name" },{ user_name: "livestreamer" }] }
    watchStreamer.client = client
    await watchStreamer["isStreamerLive"]()
    assertEquals(messageSent, true)
});