import { Command } from "../../deps.ts"

/* 
    Generate usage string based of implemented sub-commands
    returns: "[subCommand1_ | ... | subCommand_n]" or ""
*/
export function generateUsageSubCommands(subCommands: Command[]): string {
    let generatedUsage = "["
    if(subCommands.length > 0) {
        subCommands.forEach((cmd: Command) => {
            generatedUsage += cmd.toString() + "|"
        })
        generatedUsage = generatedUsage.slice(0, -1)
        generatedUsage += "]"
        return generatedUsage
    }
    return ""
}