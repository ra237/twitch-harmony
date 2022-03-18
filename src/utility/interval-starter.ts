import { WatchStreamer } from "../commands/watchStreamer.ts";
import { IntervalStarterInterface } from "./interval-starter-interface.ts";

export class IntervalStarter implements IntervalStarterInterface {

    public startInterval(lengthOfIntervalInSeconds: number, watchStreamer: WatchStreamer): number {
        return setInterval(() => watchStreamer.checkStreamerLive(), lengthOfIntervalInSeconds * 1000)
    }

}