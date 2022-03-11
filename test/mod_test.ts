// deno-lint-ignore-file no-explicit-any
import { generateUsageSubCommands } from "../src/utility/commandUsage.ts"
import { assertEquals } from "./deps.ts"
import { Twitch, TwitchExtension } from "../mod.ts"
import { CommandClient } from "../deps.ts"

function clearAllIntervals(): void {
    const highestInterval = setInterval(() => {}, 100000)
    for(let i=1; i<=highestInterval; i++) { clearInterval(i) }
}

Deno.test("twitchExtensionLoads", () => {
    const cmdClient = new CommandClient({ prefix: "!" })
    cmdClient.extensions.load(TwitchExtension)
    const twitchCmd = cmdClient.commands.find("Twitch")
    clearAllIntervals()
    assertEquals(twitchCmd?.name, "Twitch")
});

Deno.test("showUsageWhenNoArgProvided", () => {
    const client: any = {}
    const twitch = new Twitch(client)
    const usage = twitch.usage + generateUsageSubCommands(twitch.getSubCommands())
    let reply = ""
    const ctx: any = { message: { reply: function(text: string) { reply = text } } }
    twitch.execute(ctx)
    clearAllIntervals()
    assertEquals(reply, usage)
});