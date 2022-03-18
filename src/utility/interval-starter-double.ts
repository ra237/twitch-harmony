import { IntervalStarterInterface } from "./interval-starter-interface.ts";

export class IntervalStarterDouble implements IntervalStarterInterface {

    public startInterval(lengthOfIntervalInSeconds: number): number {
        return 0 // do nothing else I'm just a double
    }

}