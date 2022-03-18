import { IntervalStarterInterface } from "./interval-starter-interface.ts";

export class IntervalStarter implements IntervalStarterInterface {

    public startInterval(lengthOfIntervalInSeconds: number): number {
        return 0
        // return setInterval(() => this.isStreamerLive(), lengthOfIntervalInSeconds * 1000)
    }

}