import { IntervalStarterInterface } from "./interval-starter-interface.ts";

export class IntervalStarterDouble implements IntervalStarterInterface {

    public startInterval(_lengthOfIntervalInSeconds: number): number {
        return -1
    }

}