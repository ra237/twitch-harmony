import { Command, Embed } from "../../deps.ts"
import { CommandContext } from "https://deno.land/x/harmony@v2.5.1/mod.ts"
import { Twitch } from "../../mod.ts"

export class Help extends Command {
    name = "help"
    guildOnly = true
    usage = "**USAGE**: !twitch help"
    description = "- Provides this list of commands and their descriptions."

    public execute(ctx: CommandContext): void {
        const e = this.generateHelp()
        ctx.message.reply(e)
    }

    private generateHelp(): Embed {
        const embed = new Embed()
        embed.setTitle("All available commands:")
        embed.setColor("PURPLE")
        const allCommands: Command[] = Twitch.getAllSubCommands()
        for(const command of allCommands) {
            let args: string | undefined = command.args?.map((c) => c.name).join(" ")
            if(!args) {
                args = ""
            } else {
                args = "Argument(s): " + args + "\n"
            }
            const desc: string = args + command.description
            embed.addField({name: command.name, value: desc })
        }
        return embed
    }
}