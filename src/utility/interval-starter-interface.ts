import { WatchStreamer } from "../commands/watchStreamer.ts";

export interface IntervalStarterInterface {
    startInterval(lengthOfIntervalInSeconds: number, watchStreamer?: WatchStreamer): number
}