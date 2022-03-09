// deno-lint-ignore-file no-explicit-any
import { generateUsageSubCommands } from "../src/utility/commandUsage.ts"
import { assertEquals } from "https://deno.land/std@0.128.0/testing/asserts.ts"
import { Twitch, TwitchExtension } from "../mod.ts"
import { CommandClient } from "../deps.ts"

Deno.test("twitchExtensionLoads", () => {
    const cmdClient = new CommandClient({ prefix: "!" })
    cmdClient.extensions.load(TwitchExtension)
    const twitchCmd = cmdClient.commands.find("Twitch")
    assertEquals(twitchCmd?.name, "Twitch")
});

Deno.test("showUsageWhenNoArgProvided", () => {
    const twitch = new Twitch()
    const usage = twitch.usage + generateUsageSubCommands(twitch.getSubCommands())
    let reply = ""
    const ctx: any = { message: { reply: function(text: string) { reply = text } } }
    twitch.execute(ctx)
    assertEquals(reply, usage)
});