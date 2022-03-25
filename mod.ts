import { CommandClient, Command, Extension } from "./deps.ts"
import { CommandContext } from "https://deno.land/x/harmony@v2.5.1/mod.ts"
import { WatchStreamer } from "./src/commands/watchStreamer.ts"
import { Help } from "./src/commands/help.ts"
import { generateUsageSubCommands } from "./src/utility/commandUsage.ts"

export class TwitchExtension extends Extension {
    name = "Twitch"
    constructor(client: CommandClient, notificationChannel?: string) {
        super(client)
        const tw = new Twitch(client, notificationChannel)
        this.commands.add(tw)
        Twitch.allSubCommands = tw.getSubCommands()
        console.log(`[INFO] ${this.name} Extension loaded.`)
    }
}

export class Twitch extends Command {
    name = "Twitch"
    guildOnly = true
    usage = "**USAGE**: !twitch "
    description = "Base command for all twitch utility the bot provides."
    client: CommandClient
    static allSubCommands: Command[]

    constructor(client: CommandClient, notificationChannel?: string) {
        super()
        this.client = client
        this.subCommands = [ new Help(), new WatchStreamer(client, notificationChannel) ]
    }
    
    // this class will only execute when no valid sub-command is given
    execute(ctx: CommandContext): void {
        const subUsage = generateUsageSubCommands(this.getSubCommands())
        ctx.message.reply(this.usage + subUsage)
    }

    public static getAllSubCommands(): Command[] {
        return this.allSubCommands
    }
}
