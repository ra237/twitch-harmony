// deno-lint-ignore-file no-explicit-any
import { assertEquals} from "../deps.ts"
import { IntervalStarter } from "../../src/utility/interval-starter.ts";

Deno.test("intervalStarter", async () => {
    const intervalStarter = new IntervalStarter()
    let functionCalled = false
    const watchStreamer: any = { checkStreamerLive: () => { functionCalled = true } }
    const interval = intervalStarter.startInterval(0.01, watchStreamer) 
    await new Promise<any>(res => {
        setTimeout(() => {
            assertEquals(functionCalled, true)
            clearInterval(interval)
            res(true)
        }, 10)
    })
});