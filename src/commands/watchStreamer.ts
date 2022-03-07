import { ContentArgument, Command, Role, soxa } from "../../deps.ts"
import { CommandContext } from "https://deno.land/x/harmony@v2.5.1/mod.ts"
import type { TwitchChannel } from "../types/twitchChannel.ts"

const TWITCH_CLIENT_ID = Deno.env.get("TWITCH_CLIENT_ID")
const TWITCH_AUTH_TOKEN = Deno.env.get("TWITCH_AUTH_TOKEN")
const API_BASE_URL = "https://api.twitch.tv/helix/"

export class WatchStreamer extends Command {
    name = "watch"
    guildOnly = true
    usage = "**USAGE**: !twitch watch [STREAMER NAME]"
    description = "Adds a streamer (when needed) to watch list."
    contentArg: ContentArgument = { name: "streamer_name", match: "content" }
    args = [ this.contentArg ]
    cache: Record<string, Record<string, string>> = {}
    
    // method called when no content argument is given
    onMissingArgs(ctx: CommandContext): void {
        ctx.message.reply(this.usage)
    }

    onError(_ctx: CommandContext, err: Error) {
        console.error(err)
    }

    async execute(ctx: CommandContext): Promise<void> {
        const SEARCH_CHANNEL_URI = "search/channels?query="
        const headers = { headers: { "Authorization": "Bearer " + TWITCH_AUTH_TOKEN, "Client-Id": TWITCH_CLIENT_ID } }
        const arg_streamer: string = ctx.rawArgs[0]
        const guildId = this.getGuildId(ctx)
        const streamerCached = this.checkStreamerCached(guildId, arg_streamer)

        if(!streamerCached) {
            const req = await soxa.get(API_BASE_URL + SEARCH_CHANNEL_URI + arg_streamer + "&first=100", headers)
            const data: TwitchChannel[] = req.data.data
            this.watchStreamer(ctx, data, arg_streamer)
        } else {
            this.watchStreamerCached(ctx, arg_streamer)
        }
    }

    private async watchStreamer(ctx: CommandContext, reqData: TwitchChannel[], streamerName: string): Promise<void> {
        for(const channel of reqData) {
            if(channel.display_name.toLowerCase() === streamerName.toLowerCase()) {
                let role = await this.roleExists(ctx, streamerName)
                if(role) {
                    role.addTo(ctx.message.author)
                } else {
                    role = await this.createRoleAndAddUser(ctx, streamerName)
                }
                const guildId = this.getGuildId(ctx)
                const roleId = this.getRoleId(role)
                this.addToCache(guildId, streamerName, roleId)
                ctx.message.reply("<@&" + this.cache[guildId][streamerName] + ">")
                console.log(this.cache)
                ctx.message.reply("Streamer found! is_live: " + channel.is_live)
                return
            }
        }
        ctx.message.reply("Streamer not found!")
    }

    private async watchStreamerCached(ctx: CommandContext, streamerName: string): Promise<void> {
        const role = await this.roleExists(ctx, streamerName)
        if(role) {
            role.addTo(ctx.message.author)
        } else {
            throw new Error(`Faulty cache. Role with name ${streamerName} does not exist.`)
        }
        console.log(this.cache)
        ctx.message.reply("Streamer cached!")
    }

    private addToCache(guildId: string, streamerName: string, roleId: string): void {
        if(!this.isGuildCached(guildId)) {
            this.cache[guildId] = {}
        }
        if(!this.checkStreamerCached(guildId, streamerName)) {
            this.cache[guildId][streamerName] = roleId
        }
    }

    private checkStreamerCached(guildId: string, streamerName: string): boolean {
        if(this.cache[guildId] && streamerName in this.cache[guildId]) {
            return true
        }
        return false
    }

    private isGuildCached(guildId: string) {
        if(guildId in this.cache) {
            return true
        }
        return false
    }

    private getGuildId(ctx: CommandContext): string {
        if(typeof ctx.guild?.id === 'undefined') {
            throw new TypeError("guildId cannot be undefined.")
        }
        return ctx.guild?.id
    }

    private getRoleId(role: Role | undefined): string {
        if(typeof role === 'undefined') {
            throw new TypeError("role cannot be undefined.")
        }
        return role.id
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
                            return role
                        }
                    }
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