// deno-lint-ignore-file no-explicit-any
import { generateUsageSubCommands } from "../../src/utility/commandUsage.ts"
import { assertEquals } from "https://deno.land/std@0.128.0/testing/asserts.ts"

Deno.test("generateUsageSubCommands", () => {
    const subCommands_empty: any = []
    assertEquals(generateUsageSubCommands(subCommands_empty), "")

    const subCommands: any = ["Pog", "YEP", "NOP"]
    assertEquals(generateUsageSubCommands(subCommands), "[Pog|YEP|NOP]")
});