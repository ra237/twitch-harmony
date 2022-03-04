import { ContentArgument, CommandClient, Command, Role, Extension, soxa } from "./deps.ts"
import { CommandContext } from "https://deno.land/x/harmony@v2.5.1/mod.ts"

const TWITCH_CLIENT_ID = Deno.env.get("TWITCH_CLIENT_ID")
const TWITCH_AUTH_TOKEN = Deno.env.get("TWITCH_AUTH_TOKEN")
const API_BASE_URL = "https://api.twitch.tv/helix/"

type TwitchChannel = {
    broadcaster_language: string,
    broadcaster_login: string,
    display_name: string,
    game_id: string,
    game_name: string,
    id: string,
    is_live: boolean,
    tag_ids: string[],
    thumbnail_url: string,
    title: string,
    started_at: string
}

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

// could create another class prior named "AddStreamer" to add a streamer seperatly
class WatchStreamer extends Command {
    name = "watch"
    guildOnly = true
    usage = "**USAGE**: !twitch watch [STREAMER NAME]"
    description = "Adds a streamer (when needed) to watch list."
    contentArg: ContentArgument = { name: "streamer_name", match: "content" }
    args = [ this.contentArg ]
    cache: Record<string, string> = {}  // Record<string, Set<string>> 
    
    // method called when no content argument is given
    onMissingArgs(ctx: CommandContext): void {
        ctx.message.reply(this.usage)
    }

    onError(ctx: CommandContext, err: Error) {
        console.error(err)
    }

    async execute(ctx: CommandContext): Promise<void> {
        // cache needs to be nested into guilds (maybe?)
        const SEARCH_CHANNEL_URI = "search/channels?query="
        const headers = { headers: { "Authorization": "Bearer " + TWITCH_AUTH_TOKEN, "Client-Id": TWITCH_CLIENT_ID } }
        const arg_streamer: string = ctx.rawArgs[0]

        // TODO check cache before
        const req = await soxa.get(API_BASE_URL + SEARCH_CHANNEL_URI + arg_streamer + "&first=100", headers)
        const data: TwitchChannel[] = req.data.data
        this.watchStreamer(ctx, data, arg_streamer)
    }

    private async watchStreamer(ctx: CommandContext, reqData: TwitchChannel[], streamerName: string): Promise<void> {
        // TODO check cache before
        for(const channel of reqData) {
            if(channel.display_name.toLowerCase() === streamerName.toLowerCase()) {
                let role = await this.roleExists(ctx, streamerName)
                if(role) {
                    role.addTo(ctx.message.author)
                } else {
                    role = await this.createRoleAndAddUser(ctx, streamerName)
                }
                this.addToCache(streamerName, role?.id)
                ctx.message.reply("<@&" + this.cache[streamerName] + ">")
                console.log(this.cache)
                ctx.message.reply("Streamer found! is_live: " + channel.is_live)
                return
            }
        }
        ctx.message.reply("Streamer not found!")
    }

    private addToCache(streamerName: string, roleId: string | undefined): void {
        if(!this.checkStreamerCached(streamerName) && typeof roleId === 'string') {
            this.cache[streamerName]= roleId
        }
    }

    private checkStreamerCached(streamerName: string): boolean {
        if(streamerName in this.cache) {
            return true
        }
        return false
    }

    private createRoleAndAddUser(ctx: CommandContext, streamerName: string): Promise<Role | undefined> {
        return new Promise(res => {
            res(
                ctx.guild?.createRole({name: streamerName, color: 0, mentionable: true, hoist: false, permissions: 0})
                .then(role => { 
                    role.addTo(ctx.message.author)
                    return role
                })
            )
        })
    }

    private roleExists(ctx: CommandContext, roleName: string): Promise<Role | undefined> {
        return new Promise(res => {
            res(
                ctx.guild?.roles.fetchAll()
                .then(roles => { 
                    for(const role of roles) {
                        if(role.name === roleName) {
                            console.log("role found")
                            return role
                        }
                    }
                    console.log("role not found")
                    return undefined
                })
            )
        })
    }

    // returns class name in order for usage generation to work
    toString(): string {
        return this.name
    }
}