// deno-lint-ignore-file no-explicit-any
import { throwIfStringUndefined, getGuildId, getRoleId, createRoleAndAddUser, roleExists } from "../../src/utility/harmonyUtil.ts"
import { assertEquals, assertThrows } from "https://deno.land/std@0.128.0/testing/asserts.ts"

Deno.test("throwIfStringUndefined", () => {
    assertThrows(() => throwIfStringUndefined(undefined), TypeError)

    assertEquals(throwIfStringUndefined("epic string Pog"), "epic string Pog")
});

Deno.test("getGuildId", () => {
    const ctx_undefined: any = { }
    assertThrows(() => getGuildId(ctx_undefined), TypeError)

    const ctx: any = { guild: { id: "FeelsGoodMan" } }
    assertEquals(getGuildId(ctx), "FeelsGoodMan")
});

Deno.test("getRoleId", () => {
    const role_undefined: any = { }
    assertThrows(() => getRoleId(role_undefined), TypeError)

    const role: any = { id: "FeelsBirthdayMan" }
    assertEquals(getRoleId(role), "FeelsBirthdayMan")
});

Deno.test("createRoleAndAddUser", async () => {
    const ctx_undefined: any = { }
    const res_undefined = await createRoleAndAddUser(ctx_undefined, "")
    assertEquals(res_undefined , undefined)

    const ctx: any = { 
        guild: { 
            createRole: function () { 
                return new Promise<any>(res => {
                    res( { addTo: function(author: string) { this.name = author } } )
                }) 
            }
        }, 
        message: { 
            author: "snake" 
        } 
    }
    const res = await createRoleAndAddUser(ctx, "")
    assertEquals(res?.name, "snake")
});

Deno.test("roleExists", async () => {
    const ctx_undefined: any = { }
    const res_undefined = await roleExists(ctx_undefined, "")
    assertEquals(res_undefined , undefined)

    const ctx: any = { 
        guild: { 
            roles: {
                fetchAll: function () { 
                    return new Promise<any>(res => {
                        res( [ { name: "Greekgodx" }, { name: "xqcow" } ] )
                    }) 
                }
            }
        }
    }
    const res = await roleExists(ctx, "xqcow")
    assertEquals(res?.name, "xqcow")
});