import { beforeEach, describe, expect, it } from "bun:test";
import { ContextNotFoundError, FinalContextMutationError, SafeContext } from "it";
import { ArgumentsError, OverloadsError } from "zod-guardians";

interface TestContext {
    str: string;
    num: number;
    bool: boolean;
    finalKey: string;
    shared: string;
    recursive: number;
}

describe("class SafeContext", () => {
    let context: SafeContext<TestContext>;

    beforeEach(() => {
        context = SafeContext.create();
    });

    describe("create()", () => {
        it("Should initialize empty by default", () => {
            expect(context.snapshot()).toEqual({});
        });

        describe("Option: hideKeys", () => {
            it("Should hide specific keys from inspection and snapshot", () => {
                const ctx = SafeContext.create<TestContext>({ hideKeys: ["str"] });
                ctx.set("str", "Hidden");
                ctx.set("num", 10);

                expect(ctx.snapshot()).toEqual({ num: 10 } as any);
                expect(ctx.get("str")).toBe("Hidden");
            });

            it("Should hide all keys when set to true", () => {
                const ctx = SafeContext.create<TestContext>({ hideKeys: true });
                ctx.set("str", "Hidden");

                expect(ctx.snapshot()).toEqual({});
                expect(ctx.get("str")).toBe("Hidden");
            });
        });
    });

    describe("has()", () => {
        it("Should return true for existing keys", () => {
            context.set("str", "Exists");
            expect(context.has("str")).toBe(true);
        });

        it("Should return false for missing keys", () => {
            expect(context.has("str")).toBe(false);
        });

        describe("Behavior: Inheritance & Shadowing", () => {
            it("Should find keys in parent scopes", () => {
                context.set("str", "Parent");
                context.concurrentlySafe(() => {
                    expect(context.has("str")).toBe(true);
                });
            });

            it("Should return false if local key shadows parent but is unset", () => {
                context.set("str", "Global");
                context.concurrentlySafe(() => {
                    context.set("str", "Local", { local: true });
                    context.clear("str");

                    expect(context.has("str")).toBe(false);
                });
            });
        });

        describe("Error Handling", () => {
            it("Should throw on invalid argument type", () => {
                expect(() => context.has(123 as any)).toThrow(ArgumentsError);
            });
        });
    });

    describe("get()", () => {
        describe("Single Key Access", () => {
            it("Should return undefined for unset keys", () => {
                expect(context.get("str")).toBeUndefined();
            });

            it("Should return value for set keys", () => {
                context.set("str", "Value");
                expect(context.get("str")).toBe("Value");
            });

            it("Should support 'supply' fallback", () => {
                expect(context.get("num", { supply: () => 42 })).toBe(42);
            });

            it("Should ignore 'supply' if key exists", () => {
                context.set("num", 10);
                expect(context.get("num", { supply: () => 42 })).toBe(10);
            });
        });

        describe("Multiple Key Access", () => {
            it("Should retrieve multiple keys as object", () => {
                context.set({ str: "A", num: 1 });
                expect(context.get(["str", "num"])).toEqual({ str: "A", num: 1 });
            });

            it("Should support per-key options", () => {
                const res = context.get(["str", "num"], {
                    num: { supply: () => 99 },
                });
                expect(res).toEqual({ str: undefined, num: 99 });
            });

            it("Should ignore hideKeys configuration during get", () => {
                const ctx = SafeContext.create<TestContext>({ hideKeys: ["str"] });
                ctx.set("str", "Secret");
                expect(ctx.get(["str"])).toEqual({ str: "Secret" });
            });
        });

        describe("Error Handling", () => {
            it("Should throw OverloadsError for invalid arguments", () => {
                expect(() => context.get(123 as any)).toThrow(OverloadsError);
                expect(() => context.get("str", { supply: 123 as any })).toThrow(
                    OverloadsError,
                );
            });
        });
    });

    describe("require()", () => {
        it("Should return value if set", () => {
            context.set("str", "Value");
            expect(context.require("str")).toBe("Value");
        });

        describe("Error Handling", () => {
            it("Should throw ContextNotFoundError if unset", () => {
                expect(() => context.require("str")).toThrow(ContextNotFoundError);
            });

            it("Should throw custom message if provided", () => {
                expect(() => context.require("str", "My Error")).toThrow("My Error");
            });

            it("Should throw ArgumentsError for invalid inputs", () => {
                expect(() => context.require(123 as any)).toThrow(ArgumentsError);
            });
        });
    });

    describe("snapshot()", () => {
        it("Should return all visible keys", () => {
            context.set({ str: "A", num: 1 });
            expect(context.snapshot()).toEqual({ str: "A", num: 1 });
        });

        it("Should capture scoped changes", () => {
            context.set("str", "Global");
            using _ = context.with("str", "Scoped");
            expect(context.snapshot()).toEqual({ str: "Scoped" } as any);
        });

        it("Should respect hideKeys configuration", () => {
            const ctx = SafeContext.create<TestContext>({ hideKeys: ["num"] });
            ctx.set({ str: "A", num: 1 });
            expect(ctx.snapshot()).toEqual({ str: "A" } as any);
        });
    });

    describe("inspect()", () => {
        it("Should format string with visible keys", () => {
            context.set("str", "A");
            const inspect = Bun.inspect(context);
            expect(inspect).toContain("SafeContext");
            expect(inspect).toContain("'str'");
        });

        it("Should not show hidden keys", () => {
            const ctx = SafeContext.create<TestContext>({ hideKeys: ["str"] });
            ctx.set({ str: "A", num: 1 });
            const inspect = Bun.inspect(ctx);
            expect(inspect).not.toContain("'str'");
            expect(inspect).toContain("'num'");
        });
    });

    describe("set()", () => {
        describe("Single Key", () => {
            it("Should set value and return true", () => {
                expect(context.set("str", "Value")).toBe(true);
                expect(context.get("str")).toBe("Value");
            });

            it("Should respect 'override: false'", () => {
                context.set("str", "Original");
                expect(context.set("str", "New", { override: false })).toBe(false);
                expect(context.get("str")).toBe("Original");
            });
        });

        describe("Multiple Keys", () => {
            it("Should set multiple values atomically", () => {
                const res = context.set({ str: "A", num: 1 });
                expect(res).toEqual({ str: true, num: true });
                expect(context.get("str")).toBe("A");
                expect(context.get("num")).toBe(1);
            });

            it("Should support mixed options in multiple set", () => {
                context.set("str", "Original");
                const res = context.set(
                    { str: "New", num: 1 },
                    { str: { override: false }, num: { final: true } },
                );
                expect(res).toEqual({ str: false, num: true });
                expect(context.get("str")).toBe("Original");
            });
        });

        describe("Constraint: Final Contexts", () => {
            it("Should prevent overwriting final keys", () => {
                context.set("finalKey", "Immutable", { final: true });
                expect(() => context.set("finalKey", "New")).toThrow(
                    FinalContextMutationError,
                );
            });

            it("Should prevent multiple set if any key is final", () => {
                context.set("finalKey", "Immutable", { final: true });
                expect(() => context.set({ str: "A", finalKey: "B" })).toThrow(
                    FinalContextMutationError,
                );
            });
        });

        describe("Error Handling", () => {
            it("Should throw OverloadsError for invalid inputs", () => {
                expect(() => context.set(123 as any, "val")).toThrow(OverloadsError);
            });
        });
    });

    describe("clear()", () => {
        beforeEach(() => {
            context.set({ str: "A", num: 1 });
        });

        it("Overload: No Args - Should clear all non-final local keys", () => {
            context.clear();
            expect(context.has("str")).toBe(false);
            expect(context.has("num")).toBe(false);
        });

        it("Overload: Single Key - Should clear specific key", () => {
            context.clear("str");
            expect(context.has("str")).toBe(false);
            expect(context.has("num")).toBe(true);
        });

        it("Overload: Multiple Keys - Should clear list of keys", () => {
            context.set("bool", true);
            context.clear(["str", "num"]);
            expect(context.has("str")).toBe(false);
            expect(context.has("num")).toBe(false);
            expect(context.has("bool")).toBe(true);
        });

        describe("Constraints & Isolation", () => {
            it("Should fail when clearing final keys", () => {
                context.set("finalKey", "Final", { final: true });
                expect(() => context.clear("finalKey")).toThrow(
                    FinalContextMutationError,
                );
                expect(() => context.clear(["str", "finalKey"])).toThrow(
                    FinalContextMutationError,
                );
            });

            it("Should maintain isolation (clear only local shadow)", () => {
                context.set("str", "Global");
                context.concurrentlySafe(() => {
                    context.set("str", "Local", { local: true });
                    context.clear("str");

                    expect(context.get("str")).toBeUndefined();
                });
                expect(context.get("str")).toBe("Global");
            });

            it("Should allow resurrecting cleared keys (Zombie State)", () => {
                context.concurrentlySafe(() => {
                    context.set("str", "Alive", { local: true });
                    context.clear("str");
                    context.set("str", "Resurrected", { local: true });
                    expect(context.get("str")).toBe("Resurrected");
                });
            });
        });

        describe("Error Handling", () => {
            it("Should throw OverloadsError for invalid inputs", () => {
                expect(() => context.clear(123 as any)).toThrow(OverloadsError);
            });
        });
    });

    describe("with()", () => {
        describe("Single Key Scope", () => {
            it("Should apply temporary context using 'using'", () => {
                {
                    using _ = context.with("str", "Temp");
                    expect(context.get("str")).toBe("Temp");
                }
                expect(context.get("str")).toBeUndefined();
            });

            it("Should restore previous value", () => {
                context.set("str", "Original");
                {
                    using _ = context.with("str", "Temp");
                    expect(context.get("str")).toBe("Temp");
                }
                expect(context.get("str")).toBe("Original");
            });

            it("Should expose metadata (changed, previous, context)", () => {
                context.set("str", "Original");
                using ctx = context.with("str", "Temp");
                expect(ctx.context).toBe("Temp");
                expect(ctx.previous).toBe("Original");
                expect(ctx.changed).toBe(true);
            });

            it("Should respect options (override: false)", () => {
                context.set("str", "Original");
                using ctx = context.with("str", "Temp", { override: false });
                expect(ctx.changed).toBe(false);
                expect(context.get("str")).toBe("Original");
            });
        });

        describe("Multiple Key Scope", () => {
            it("Should apply multiple contexts", () => {
                {
                    using _ = context.with({ str: "Temp", num: 99 });
                    expect(context.get("str")).toBe("Temp");
                    expect(context.get("num")).toBe(99);
                }
                expect(context.get("str")).toBeUndefined();
            });

            it("Should rollback all if one fails (Atomicity)", () => {
                context.set("finalKey", "Final", { final: true });
                expect(() => {
                    using _ = context.with({ num: 99, finalKey: "Try" });
                }).toThrow(FinalContextMutationError);
                expect(context.get("num")).toBeUndefined();
            });

            it("Should expose scoped metadata object", () => {
                using multi = context.with({ str: "A", num: 1 });
                expect(multi.scope.str.context).toBe("A");
                expect(multi.scope.num.context).toBe(1);
            });
        });

        describe("Advanced Scenarios", () => {
            it("Should enforce final constraint inside scope creation", () => {
                context.set("finalKey", "Val", { final: true });
                expect(() => {
                    using _ = context.with("finalKey", "New");
                }).toThrow(FinalContextMutationError);
            });

            it("Should enforce final constraint set by the scope itself", () => {
                context.set("num", 10);
                {
                    using _ = context.with("num", 20, { final: true, override: true });
                    expect(() => context.set("num", 30)).toThrow(
                        FinalContextMutationError,
                    );
                }
                expect(context.get("num")).toBe(10);
            });

            it("Should handle massive recursive nesting (Stack Test)", () => {
                const depth = 500;
                context.set("recursive", 0);

                const recurse = (level: number) => {
                    if (level > depth) {
                        expect(context.get("recursive")).toBe(depth);
                        return;
                    }
                    {
                        using _ = context.with("recursive", level);
                        expect(context.get("recursive")).toBe(level);
                        recurse(level + 1);
                        expect(context.get("recursive")).toBe(level);
                    }
                };

                recurse(1);
                expect(context.get("recursive")).toBe(0);
            });
        });

        describe("Error Handling", () => {
            it("Should throw OverloadsError for invalid inputs", () => {
                expect(() => context.with(123 as any, "val")).toThrow(OverloadsError);
            });
        });
    });

    describe("concurrentlySafe()", () => {
        describe("Behavior: Isolation", () => {
            it("Should isolate changes to local callback scope", () => {
                context.set("str", "Global");
                context.concurrentlySafe(() => {
                    context.set("str", "Local", { local: true });
                    expect(context.get("str")).toBe("Local");
                });
                expect(context.get("str")).toBe("Global");
            });

            it("Should propagate changes if local is false", () => {
                context.set("str", "Global");
                context.concurrentlySafe(() => {
                    context.set("str", "Updated", { local: false });
                });
                expect(context.get("str")).toBe("Updated");
            });

            it("Should forbid shadowing global final keys locally", () => {
                context.set("finalKey", "Global", { final: true });
                context.concurrentlySafe(() => {
                    expect(() => {
                        context.set("finalKey", "Shadow", { local: true });
                    }).toThrow(FinalContextMutationError);
                    expect(context.get("finalKey")).toBe("Global");
                });
            });
        });

        describe("Behavior: Inheritance & Copying", () => {
            it("Should inherit values from parent by default", () => {
                context.set("str", "Global");
                context.concurrentlySafe(() => {
                    expect(context.get("str")).toBe("Global");
                });
            });

            it("Should support copying all contexts ('current')", () => {
                context.set("str", "Global");
                context.concurrentlySafe(
                    () => {
                        context.set("str", "Local", { local: true });
                        expect(context.get("str")).toBe("Local");
                    },
                    { contexts: "current" },
                );
                expect(context.get("str")).toBe("Global");
            });

            it("Should support copying specific keys list", () => {
                context.set({ str: "Global", num: 10 });

                context.concurrentlySafe(
                    () => {
                        context.set("str", "Local", { local: true });
                        expect(context.get("str")).toBe("Local");
                        expect(context.get("num")).toBe(10);
                    },
                    { contexts: ["str"] },
                );
            });
        });

        describe("Stress & Concurrency Scenarios", () => {
            it("Should handle high concurrency with random delays", async () => {
                const operations = Array.from({ length: 100 }, (_, i) => i);
                context.set("num", -1);

                await Promise.all(
                    operations.map((index) =>
                        context.concurrentlySafe(async () => {
                            context.set("num", index, { local: true });
                            await Bun.sleep(Math.random() * 5);
                            expect(context.get("num")).toBe(index);
                        }),
                    ),
                );
                expect(context.get("num")).toBe(-1);
            });

            it("Should handle massive amount of concurrent contexts (1e3)", async () => {
                const size = 1000;
                const range = Array.from({ length: size }, (_, i) => i);
                context.set("num", -1);

                await Promise.all(
                    range.map((i) =>
                        context.concurrentlySafe(
                            async () => {
                                context.set("num", i);
                                expect(context.get("num")).toBe(i);
                            },
                            { contexts: ["num"] },
                        ),
                    ),
                );
                expect(context.get("num")).toBe(-1);
            });

            it("Should ensure total isolation among siblings (Shared State Stress)", async () => {
                const siblings = 1000;
                context.set("shared", "root");

                await Promise.all(
                    Array.from({ length: siblings }).map(async (_, index) => {
                        return context.concurrentlySafe(async () => {
                            const myValue = `sibling-${index}`;
                            context.set("shared", myValue, { local: true });
                            await Bun.sleep(Math.random() * 2);
                            expect(context.get("shared")).toBe(myValue);
                        });
                    }),
                );
                expect(context.get("shared")).toBe("root");
            });

            it("Should handle massive recursive nesting (Depth: 500)", () => {
                const depth = 500;
                context.set("recursive", 0);

                const recurse = (level: number) => {
                    if (level > depth) return;
                    context.concurrentlySafe(() => {
                        expect(context.get("recursive")).toBe(level - 1);
                        context.set("recursive", level, { local: true });
                        expect(context.get("recursive")).toBe(level);
                        recurse(level + 1);
                        expect(context.get("recursive")).toBe(level);
                    });
                };

                recurse(1);
                expect(context.get("recursive")).toBe(0);
            });
        });

        describe("Error Handling", () => {
            it("Should guarantee rollback on exception", () => {
                context.set("num", 0);
                expect(() =>
                    context.concurrentlySafe(() => {
                        context.set("num", 1, { local: true });
                        throw new Error("Boom");
                    }),
                ).toThrow("Boom");
                expect(context.get("num")).toBe(0);
            });

            it("Should throw ArgumentsError for invalid inputs", () => {
                expect(() => context.concurrentlySafe(123 as any)).toThrow(
                    ArgumentsError,
                );
            });
        });
    });
});
