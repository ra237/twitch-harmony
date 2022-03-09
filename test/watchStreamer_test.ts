// deno-lint-ignore-file no-explicit-any
import { WatchStreamer } from "../src/commands/watchStreamer.ts"
import { assertEquals, assertThrows } from "https://deno.land/std@0.128.0/testing/asserts.ts"

Deno.test("watchStreamerCached",  async () => {
    const watchStreamer = new WatchStreamer()
    const ctx_emptyRole: any = { 
        guild: 
            { 
                roles: 
                    { 
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
        guild: 
            { 
                roles: 
                    { 
                        fetchAll: 
                            function() {
                                return new Promise<any>(res => { res([ { name: "epicStreamer", addTo: function(usr: string) { messageAuthor = usr } } ]) })
                            } 
                    } 
            },
        message:
            {
                author: "epicDiscordUser",
                reply: function() {}
            }
    }
    await watchStreamer["watchStreamerCached"](ctx_withRole, "epicStreamer")
    assertEquals(messageAuthor, "epicDiscordUser")
});

Deno.test("addToCache", () => {
    const watchStreamer = new WatchStreamer()
    watchStreamer["addToCache"]("realGuildId", "epicStreamer", "123abc")
    assertEquals(watchStreamer["cache"]["realGuildId"], { "epicStreamer": "123abc" })
});

Deno.test("checkStreamerCached", () => {
    const watchStreamer = new WatchStreamer()
    assertEquals(watchStreamer["checkStreamerCached"]("abc", "abc"), false)

    watchStreamer["cache"] = { "realGuildId": { "epicStreamer": "123abc"} }
    assertEquals(watchStreamer["checkStreamerCached"]("realGuildId", "epicStreamer"), true)
});

Deno.test("isGuildCached", () => {
    const watchStreamer = new WatchStreamer()
    assertEquals(watchStreamer["isGuildCached"]("abc"), false)
    
    watchStreamer["cache"] = { "realGuildId": {} }
    assertEquals(watchStreamer["isGuildCached"]("realGuildId"), true)
});

Deno.test("toString", () => {
    const watchStreamer = new WatchStreamer()
    assertEquals(watchStreamer.toString(), watchStreamer.name)
});