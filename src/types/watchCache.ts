export type WatchCache = {
    [guildId: string]: {
        [streamerName: string]: {
            streamerId: string,
            is_live: boolean,
            nextCheck: number,
            roleId: string
        }
    }
}