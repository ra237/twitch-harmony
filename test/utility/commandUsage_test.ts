// deno-lint-ignore-file no-explicit-any
import { generateUsageSubCommands } from "../../src/utility/commandUsage.ts"
import { assertEquals } from "https://deno.land/std@0.128.0/testing/asserts.ts"

Deno.test("generateUsageSubCommands", () => {
    const subCommands_empty: any = []
    assertEquals(generateUsageSubCommands(subCommands_empty), "")

    const subCommands: any = [{name:"Pog"}, {name:"YEP"}, {name:"NOP"}]
    assertEquals(generateUsageSubCommands(subCommands), "[pog|yep|nop]")
});