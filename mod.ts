import { CommandClient, Command, Extension } from "./deps.ts"
import { CommandContext } from "https://deno.land/x/harmony@v2.5.1/mod.ts"
import { WatchStreamer } from "./src/commands/watchStreamer.ts"

export class TwitchExtension extends Extension {
    name = "Twitch"
    constructor(client: CommandClient) {
        super(client)
        this.commands.add(Twitch)
        console.log(`\t+ ${this.name} Extension loaded.`)
    }
}

export class Twitch extends Command {
    name = "Twitch"
    guildOnly = true
    subCommands = [ new WatchStreamer() ]
    usage = "**USAGE**: !twitch ["
    description = "Base command for all twitch utility the bot provides."

    // this class will only execute when no valid sub-command is given
    execute(ctx: CommandContext): void {
        ctx.message.reply(this.generateUsage())
    }

    // generate usage string based of implemented sub-commands
    private generateUsage(): string {
        let generatedUsage = this.usage
        this.getSubCommands().forEach((cmd: Command) => {
            generatedUsage += cmd.toString() + "|"
        })
        generatedUsage = generatedUsage.slice(0, -1)
        generatedUsage += "]"
        return generatedUsage
    }
}
