import { ContentArgument, Command, CommandClient } from "../../deps.ts"
import { CommandContext } from "https://deno.land/x/harmony@v2.5.1/mod.ts"
import { getGuildId, getRoleId, createRoleAndAddUser, roleExists, findTextChannelOfGuild } from "../utility/harmonyUtil.ts"
import { searchChannel, searchStreams } from "../utility/twitchAPI.ts"
import { getDateInSeconds } from "../utility/util.ts"
import type { WatchCache } from "../types/watchCache.ts"
import { IntervalStarterInterface } from "../utility/interval-starter-interface.ts"
import { IntervalStarter } from "../utility/interval-starter.ts"

// time in seconds
const CHECK_INTERVAL = 16
const NEXT_CHECK_WHEN_LIVE = 60 * 5
const NEXT_CHECK_WHEN_OFFLINE = 60 + 15

export class WatchStreamer extends Command {
    name = "watch"
    guildOnly = true
    usage = "**USAGE**: !twitch watch [STREAMER_NAME]"
    description = "- Adds a streamer to the watch list and notifies you when the stream is running.\n- You'll be added to a new Discord role which gets tagged once given streamer is online."
    contentArg: ContentArgument = { name: "STREAMER_NAME", match: "content" }
    args = [this.contentArg]
    cache: WatchCache = {}
    client: CommandClient
    notificationChannel: string
    intervalStarter: IntervalStarterInterface
    interval: number

    constructor(client: CommandClient, notificationChannel?: string, intervalStarter?: IntervalStarterInterface) {
        super()
        this.client = client

        if(typeof notificationChannel !== "undefined") {
            this.notificationChannel = notificationChannel
            console.log(`[INFO] Using notification channel ${this.notificationChannel}.`)
        } else {
            this.notificationChannel = "twitch"
            console.log(`[WARNING] NO NOTIFICATION CHANNEL GIVEN. USING CHANNEL ${this.notificationChannel}!`)
        }
        
        if(typeof intervalStarter !== "undefined") {
            this.intervalStarter = intervalStarter
        } else {
            this.intervalStarter = new IntervalStarter()
        }

        this.interval = this.intervalStarter.startInterval(CHECK_INTERVAL, this)
    }

    // method called when no content argument is given
    public onMissingArgs(ctx: CommandContext): void {
        ctx.message.reply(this.usage)
    }

    public async execute(ctx: CommandContext): Promise<void> {
        const arg_streamer: string = ctx.rawArgs[0].toLowerCase()
        const guildId = getGuildId(ctx)
        const streamerCached = this.checkStreamerCached(guildId, arg_streamer)

        if (!streamerCached) {
            await this.watchStreamer(ctx, arg_streamer)
        } else {
            await this.watchStreamerCached(ctx, arg_streamer)
        }
    }

    private async watchStreamer(ctx: CommandContext, streamerName: string): Promise<void> {
        const channel = await searchChannel(streamerName)
        if (typeof channel !== 'undefined') {
            let role = await roleExists(ctx, streamerName)
            if (role) {
                role.addTo(ctx.message.author)
            } else {
                role = await createRoleAndAddUser(ctx, streamerName)
            }
            const guildId = getGuildId(ctx)
            const roleId = getRoleId(role)
            this.addToCache(guildId, streamerName, channel.id, roleId)
            ctx.message.reply(`Streamer ${streamerName} added!`)
        } else {
            ctx.message.reply("Streamer not found!")
        }
    }

    private async watchStreamerCached(ctx: CommandContext, streamerName: string): Promise<void> {
        const role = await roleExists(ctx, streamerName)
        if (role) {
            role.addTo(ctx.message.author)
            ctx.message.reply(`You are now watching ${streamerName}`)
        } else {
            throw new Error(`Faulty cache. Role with name ${streamerName} does not exist.`)
        }
    }

    public async checkStreamerLive(): Promise<void> {
        for (const guildId of Object.keys(this.cache)) {
            const currentGuild = this.cache[guildId]
            const streamersToBeChecked: { name: string, id: string }[] = []

            for (const s of Object.keys(currentGuild)) {
                const streamer = currentGuild[s]
                if (streamer.nextCheck <= getDateInSeconds()) {
                    streamersToBeChecked.push({ name: s, id: streamer.streamerId })
                }
            }
            const streamerIds = streamersToBeChecked.map(streamer => streamer.id)
            const activeStreams = await this.searchStreams(streamerIds)

            for (const streamer of streamersToBeChecked) {
                if (!activeStreams.some(s => s.user_name.toLowerCase() === streamer.name)) {
                    currentGuild[streamer.name].is_live = false
                    currentGuild[streamer.name].nextCheck = getDateInSeconds() + NEXT_CHECK_WHEN_OFFLINE
                }
            }

            for (const stream of activeStreams) {
                const streamerName = stream.user_name.toLowerCase()
                const streamer = currentGuild[streamerName]
                streamer.nextCheck = getDateInSeconds() + NEXT_CHECK_WHEN_LIVE
                if (streamer.is_live) { break }

                streamer.is_live = true
                const roleToPing = streamer.roleId

                const guildTextChannel = await findTextChannelOfGuild(this.client, guildId, this.notificationChannel)
                if (typeof guildTextChannel !== 'undefined') {
                    guildTextChannel.send(`<@&${roleToPing}> is live! Go watch him on:\nhttps://twitch.tv/${stream.user_name}`)
                }

            }
        }
    }

    private async searchStreams(streamerIds: string[]) {
        return await searchStreams(streamerIds)
    }

    private addToCache(guildId: string, streamerName: string, streamerId: string, roleId: string): void {
        const defaultStreamer = {
            streamerId: streamerId,
            is_live: false,
            nextCheck: getDateInSeconds(),
            roleId: roleId
        }

        if (!this.isGuildCached(guildId)) {
            this.cache[guildId] = {}
            this.cache[guildId][streamerName] = defaultStreamer
        }

        if (!this.checkStreamerCached(guildId, streamerName)) {
            this.cache[guildId][streamerName] = defaultStreamer
        }
    }

    private checkStreamerCached(guildId: string, streamerName: string): boolean {
        if (this.cache[guildId] && streamerName in this.cache[guildId]) {
            return true
        }
        return false
    }

    private isGuildCached(guildId: string): boolean {
        if (guildId in this.cache) {
            return true
        }
        return false
    }
}