import { CommandClient, Role } from "../../deps.ts"
import { CommandContext } from "https://deno.land/x/harmony@v2.5.1/mod.ts"
import type { Collection, Guild, GuildChannels, TextChannel } from "../../deps.ts"

export function throwIfStringUndefined(arg: string | undefined): string {
    if(typeof arg === 'undefined') {
        const argName: string = Object.keys({arg})[0]
        throw new TypeError(`${argName} cannot be undefined.`)
    }
    return arg
}

export function getGuildId(ctx: CommandContext): string {
    const guildId: string = throwIfStringUndefined(ctx.guild?.id)
    return guildId
}

export function getRoleId(role: Role | undefined): string {
    const roleId: string = throwIfStringUndefined(role?.id)
    return roleId
}

export async function createRoleAndAddUser(ctx: CommandContext, streamerName: string): Promise<Role | undefined> {
    const role = await ctx.guild?.createRole({name: streamerName, color: 0, mentionable: true, hoist: false, permissions: 0})
    if(typeof role !== "undefined") {
        role.addTo(ctx.message.author)
    }
    return role
}

export async function roleExists(ctx: CommandContext, roleName: string): Promise<Role | undefined> {
    const roles = await ctx.guild?.roles.fetchAll()

    if(typeof roles == "undefined") {
        return undefined
    }

    for(const role of roles) {
        if(role.name === roleName) {
            return role
        }
    }
    return undefined
}

export async function getAllGuilds(client: CommandClient): Promise<Collection<string, Guild>> {
    return await client.guilds.collection() 
}

export async function getAllChannelsOfGuild(client: CommandClient, guildId: string): Promise<GuildChannels[] | undefined> {
    const allGuilds = await getAllGuilds(client)
    const currentGuild = allGuilds.get(guildId)
    return await currentGuild?.channels.array()
}

export async function findTextChannelOfGuild(client: CommandClient, guildId: string, channelName: string): Promise<TextChannel | undefined> {
    const channels = await getAllChannelsOfGuild(client, guildId)
    if(typeof channels === "undefined") {
        return undefined
    }
    const channel = channels.find(c => c.name === channelName)
    if(typeof channel === "undefined") {
        return undefined
    }
    if(channel.isText()) {
        return channel
    }
    return undefined
}