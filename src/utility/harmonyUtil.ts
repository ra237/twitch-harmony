import { Role } from "../../deps.ts"
import { CommandContext } from "https://deno.land/x/harmony@v2.5.1/mod.ts"

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

export function createRoleAndAddUser(ctx: CommandContext, streamerName: string): Promise<Role | undefined> {
    return new Promise(res => {
        res(
            ctx.guild?.createRole({name: streamerName, color: 0, mentionable: true, hoist: false, permissions: 0})
            .then((role: Role) => { 
                role.addTo(ctx.message.author)
                return role
            })
        )
    })
}

export function roleExists(ctx: CommandContext, roleName: string): Promise<Role | undefined> {
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