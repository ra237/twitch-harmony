// deno-lint-ignore-file no-explicit-any
import { assertEquals } from "./deps.ts"
import { Help } from "../src/commands/help.ts"
import { TwitchExtension } from "../mod.ts"
import { Embed, CommandClient } from "../deps.ts"

function clearAllIntervals(): void {
    const highestInterval = setInterval(() => {}, 100000)
    for(let i=1; i<=highestInterval; i++) { clearInterval(i) }
}

Deno.test("execute", () => {
    const help = new Help()
    clearAllIntervals()
    let reply = ""
    const ctx: any = { message: { reply: (text: string) => reply = text } }
    help["generateHelp"] = () => { const r: any = "test"; return r }
    help.execute(ctx)
    assertEquals(reply,"test")
});

Deno.test("generateHelp", () => {
    const client = new CommandClient({
        prefix: '!'
    })
    const ext = new TwitchExtension(client)
    client.extensions.load(ext)
    const help = new Help()
    clearAllIntervals()
    const helpEmbed: Embed = help["generateHelp"]()
    client.extensions.unload(ext)
    assertEquals(helpEmbed instanceof Embed,true)
});