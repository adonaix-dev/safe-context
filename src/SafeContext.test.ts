import { beforeEach, describe, expect, it } from "bun:test";
import { ContextNotFoundError, FinalOverrideError, SafeContext } from "it";
import { ArgumentsError, OverloadsError } from "zod-guardians";

interface Context {
    name: string;
    address: string;
    count: number;
    id: number;
}

describe("class SafeContext()", () => {
    let context!: SafeContext<Context>;

    beforeEach(() => {
        context = new SafeContext();
    });

    describe("constructor()", () => {
        it("Should initialize with default options", () => {
            const ctx = new SafeContext<Context>();
            expect(ctx.snapshot()).toEqual({});
        });

        it("Should initialize with hidden keys", () => {
            const ctx = new SafeContext<Context>({ hideKeys: ["name"] });
            ctx.set("name", "Hidden");
            ctx.set("count", 10);

            expect(ctx.snapshot()).toEqual({ count: 10 } as any);
            expect(ctx.get("name")).toBe("Hidden");
        });

        it("Should initialize with all keys hidden", () => {
            const ctx = new SafeContext<Context>({ hideKeys: true });
            ctx.set("name", "Hidden");
            ctx.set("count", 10);

            expect(ctx.snapshot()).toEqual({});
            expect(ctx.get("name")).toBe("Hidden");
        });
    });

    describe("has()", () => {
        it("Should return true if key is set", () => {
            context.set("name", "Alice");
            expect(context.has("name")).toBe(true);
        });

        it("Should return false if key is not set", () => {
            expect(context.has("name")).toBe(false);
        });

        it("Should check parent scopes", () => {
            context.set("name", "Alice");
            context.concurrentlySafe(() => {
                expect(context.has("name")).toBe(true);
            });
        });

        it("Type-check: should throw for invalid arguments", () => {
            expect(() => context.has(123 as any)).toThrow(ArgumentsError);
        });
    });

    describe("get()", () => {
        describe("Single key", () => {
            it("Should return undefined for unset keys", () => {
                expect(context.get("name")).toBeUndefined();
            });

            it("Should return the value for set keys", () => {
                context.set("name", "Alice");
                expect(context.get("name")).toBe("Alice");
            });

            it("Should use supply function if key is unset", () => {
                const value = context.get("count", { supply: () => 42 });
                expect(value).toBe(42);
                expect(context.get("count")).toBe(42);
            });

            it("Should not use supply function if key is already set", () => {
                context.set("count", 10);
                const value = context.get("count", { supply: () => 42 });
                expect(value).toBe(10);
            });
        });

        describe("Multiple keys", () => {
            it("Should return object with requested keys", () => {
                context.set("name", "Alice");
                context.set("count", 10);

                const result = context.get(["name", "count"]);
                expect(result).toEqual({ name: "Alice", count: 10 });
            });

            it("Should support options per key", () => {
                const result = context.get(["name", "count"], {
                    count: { supply: () => 99 },
                });
                expect(result).toEqual({ name: undefined, count: 99 });
            });

            it("Should retrieve keys even if hidden", () => {
                const ctx = new SafeContext<Context>({ hideKeys: ["name"] });
                ctx.set("name", "Secret");
                expect(ctx.get(["name"])).toEqual({ name: "Secret" });
            });
        });

        it("Type-check: should throw for invalid arguments", () => {
            expect(() => context.get(123 as any)).toThrow(OverloadsError);
            expect(() => context.get("name", { supply: 123 as any })).toThrow(
                OverloadsError,
            );
            expect(() => context.get(["name"], { name: { supply: 123 as any } })).toThrow(
                OverloadsError,
            );
        });
    });

    describe("require()", () => {
        it("Should return value if set", () => {
            context.set("name", "Alice");
            expect(context.require("name")).toBe("Alice");
        });

        it("Should throw ContextNotFoundError if unset", () => {
            expect(() => context.require("name")).toThrow(ContextNotFoundError);
        });

        it("Should throw with custom message", () => {
            expect(() => context.require("name", "Custom Error")).toThrow("Custom Error");
        });

        it("Type-check: should throw for invalid arguments", () => {
            expect(() => context.require(123 as any)).toThrow(ArgumentsError);
            expect(() => context.require("name", 123 as any)).toThrow(ArgumentsError);
        });
    });

    describe("set()", () => {
        describe("Single key", () => {
            it("Should set value and return true", () => {
                expect(context.set("name", "Alice")).toBe(true);
                expect(context.get("name")).toBe("Alice");
            });

            it("Should return false if override is false and value exists", () => {
                context.set("name", "Alice");
                expect(context.set("name", "Bob", { override: false })).toBe(false);
                expect(context.get("name")).toBe("Alice");
            });

            it("Should throw FinalOverrideError if overwriting final context", () => {
                context.set("name", "Alice", { final: true });
                expect(() => context.set("name", "Bob")).toThrow(FinalOverrideError);
            });

            it("Should allow overwriting if not final", () => {
                context.set("name", "Alice");
                expect(context.set("name", "Bob")).toBe(true);
                expect(context.get("name")).toBe("Bob");
            });
        });

        describe("Multiple keys", () => {
            it("Should set multiple values", () => {
                const result = context.set({ name: "Alice", count: 10 });
                expect(result).toEqual({ name: true, count: true });
                expect(context.get("name")).toBe("Alice");
                expect(context.get("count")).toBe(10);
            });

            it("Should support options per key in multiple set", () => {
                context.set("name", "Original");
                const result = context.set(
                    { name: "New", count: 20 },
                    { name: { override: false }, count: { final: true } },
                );
                expect(result).toEqual({ name: false, count: true });
                expect(context.get("name")).toBe("Original");
                expect(context.get("count")).toBe(20);
            });

            it("Should throw FinalOverrideError if any key is final", () => {
                context.set("name", "Alice", { final: true });
                expect(() => context.set({ name: "Bob", count: 10 })).toThrow(
                    FinalOverrideError,
                );
            });
        });

        it("Type-check: should throw for invalid arguments", () => {
            expect(() => context.set(123 as any, "val")).toThrow(OverloadsError);
            expect(() => context.set("name", "val", { final: "yes" as any })).toThrow(
                OverloadsError,
            );
        });
    });

    describe("with()", () => {
        describe("Single key", () => {
            it("Should temporarily set value using 'using'", () => {
                {
                    using _ = context.with("name", "Temp");
                    expect(context.get("name")).toBe("Temp");
                }
                expect(context.get("name")).toBeUndefined();
            });

            it("Should restore previous value", () => {
                context.set("name", "Original");
                {
                    using _ = context.with("name", "Temp");
                    expect(context.get("name")).toBe("Temp");
                }
                expect(context.get("name")).toBe("Original");
            });

            it("Should return context metadata", () => {
                context.set("name", "Original");
                {
                    using ctx = context.with("name", "Temp");
                    expect(ctx.context).toBe("Temp");
                    expect(ctx.previous).toBe("Original");
                    expect(ctx.changed).toBe(true);
                }
            });

            it("Should respect override: false", () => {
                context.set("name", "Original");
                {
                    using ctx = context.with("name", "Temp", { override: false });
                    expect(ctx.changed).toBe(false);
                    expect(context.get("name")).toBe("Original");
                }
            });

            it("Should throw FinalOverrideError on creation", () => {
                context.set("name", "Final", { final: true });
                expect(() => {
                    using _ = context.with("name", "Temp");
                }).toThrow(FinalOverrideError);
            });

            it("Should restore final status", () => {
                context.set("count", 10);
                {
                    using _ = context.with("count", 20, {
                        final: true,
                        override: true,
                        local: true,
                    });
                    expect(context.get("count")).toBe(20);

                    expect(() => context.set("count", 30)).toThrow(FinalOverrideError);
                }

                expect(context.get("count")).toBe(10);
            });
        });

        describe("Multiple keys", () => {
            it("Should temporarily set multiple values", () => {
                {
                    using _ = context.with({ name: "Temp", count: 99 });
                    expect(context.get("name")).toBe("Temp");
                    expect(context.get("count")).toBe(99);
                }
                expect(context.get("name")).toBeUndefined();
                expect(context.get("count")).toBeUndefined();
            });

            it("Should rollback all if one fails", () => {
                context.set("name", "Final", { final: true });
                expect(() => {
                    using _ = context.with({ count: 99, name: "Temp" });
                }).toThrow(FinalOverrideError);
                expect(context.get("count")).toBeUndefined();
            });

            it("Should expose scope metadata", () => {
                {
                    using multi = context.with({ name: "A", count: 1 });
                    expect(multi.scope.name.context).toBe("A");
                    expect(multi.scope.count.context).toBe(1);
                }
            });

            it("Should handle partial override: false in multiple keys", () => {
                context.set("name", "Global");
                {
                    using multi = context.with(
                        { name: "Scoped", count: 1 },
                        { name: { override: false } },
                    );
                    expect(multi.scope.name.changed).toBe(false);
                    expect(context.get("name")).toBe("Global");
                    expect(context.get("count")).toBe(1);
                }
            });
        });

        it("Type-check: should throw for invalid arguments", () => {
            expect(() => context.with(123 as any, "val")).toThrow(OverloadsError);
            expect(() => context.with("name", "val", { local: "yes" as any })).toThrow(
                OverloadsError,
            );
        });
    });

    describe("concurrentlySafe()", () => {
        it("Should isolate changes in scope", () => {
            context.set("name", "Global");
            context.concurrentlySafe(() => {
                context.set("name", "Local", { local: true });
                expect(context.get("name")).toBe("Local");
            });
            expect(context.get("name")).toBe("Global");
        });

        it("Should inherit values from parent", () => {
            context.set("name", "Global");
            context.concurrentlySafe(() => {
                expect(context.get("name")).toBe("Global");
            });
        });

        it("Should support copying contexts ('current')", () => {
            context.set("name", "Global");
            context.concurrentlySafe(
                () => {
                    context.set("name", "Local", { local: true });
                    expect(context.get("name")).toBe("Local");
                },
                { contexts: "current" },
            );
            expect(context.get("name")).toBe("Global");
        });

        it("Should support copying specific keys", () => {
            context.set("name", "Global");
            context.set("count", 10);

            context.concurrentlySafe(
                () => {
                    context.set("name", "Local", { local: true });
                    expect(context.get("name")).toBe("Local");
                },
                { contexts: ["name"] },
            );

            expect(context.get("name")).toBe("Global");
        });

        it("Should propagate globals if local is false inside safe scope", () => {
            context.set("address", "Global St");

            context.concurrentlySafe(() => {
                context.set("address", "Updated St", { local: false });
            });

            expect(context.get("address")).toBe("Updated St");
        });

        it("Should return callback result", () => {
            const result = context.concurrentlySafe(() => 123);
            expect(result).toBe(123);
        });

        it("Should handle high concurrency with random delays", async () => {
            const operations = Array.from({ length: 100 }, (_, i) => i);
            context.set("count", -1);

            await Promise.all(
                operations.map((index) =>
                    context.concurrentlySafe(async () => {
                        context.set("count", index, { local: true });
                        await Bun.sleep(Math.random() * 5);
                        expect(context.get("count")).toBe(index);
                    }),
                ),
            );

            expect(context.get("count")).toBe(-1);
        });

        it("Should handle massive amount of concurrent contexts (1e3)", async () => {
            const size = 1e3;
            const range = Array.from({ length: size }, (_, i) => i);
            context.set("id", -1);

            await Promise.all(
                range.map((i) =>
                    context.concurrentlySafe(
                        async () => {
                            context.set("id", i);
                            expect(context.get("id")).toBe(i);
                        },
                        {
                            contexts: ["id"],
                        },
                    ),
                ),
            );

            expect(context.get("id")).toBe(-1);
        });

        it("Should guaranteed rollback on exception", () => {
            context.set("count", 0);
            expect(() =>
                context.concurrentlySafe(() => {
                    context.set("count", 1, { local: true });
                    throw new Error("Boom");
                }),
            ).toThrow("Boom");
            expect(context.get("count")).toBe(0);
        });

        it("Type-check: should throw for invalid arguments", () => {
            expect(() => context.concurrentlySafe(123 as any)).toThrow(ArgumentsError);
            expect(() =>
                context.concurrentlySafe(() => {}, { contexts: 123 as any }),
            ).toThrow(ArgumentsError);
        });
    });

    describe("snapshot()", () => {
        it("Should return all visible keys", () => {
            context.set("name", "Alice");
            context.set("count", 10);
            expect(context.snapshot()).toEqual({ name: "Alice", count: 10 });
        });

        it("Should respect hideKeys from constructor", () => {
            const hiddenCtx = new SafeContext<Context>({ hideKeys: ["count"] });
            hiddenCtx.set("name", "Alice");
            hiddenCtx.set("count", 10);
            expect(hiddenCtx.snapshot()).toEqual({ name: "Alice" } as any);
        });

        it("Should capture scoped changes", () => {
            context.set("name", "Global");
            {
                using _ = context.with("name", "Scoped");
                expect(context.snapshot()).toEqual({ name: "Scoped" } as any);
            }
        });

        it("Should respect hideKeys inside scopes", () => {
            const ctx = new SafeContext<Context>({ hideKeys: ["id"] });
            ctx.set("id", 1);
            {
                using _ = ctx.with("id", 2);
                expect(ctx.snapshot()).toEqual({});
            }
        });
    });

    describe("clear()", () => {
        it("Should remove non-final keys", () => {
            context.set("name", "Alice");
            context.clear();
            expect(context.has("name")).toBe(false);
        });

        it("Should keep final keys", () => {
            context.set("name", "Alice", { final: true });
            context.clear();
            expect(context.has("name")).toBe(true);
            expect(context.get("name")).toBe("Alice");
        });

        it("Should only clear local keys inside concurrentlySafe", () => {
            context.set("name", "Global");
            context.concurrentlySafe(() => {
                context.set("name", "Local", { local: true });
                context.clear();
                expect(context.get("name")).toBe("Global"); // Falls back to parent
            });
            expect(context.get("name")).toBe("Global");
        });
    });

    describe("inspect()", () => {
        it("Should return formatted string", () => {
            context.set("name", "Alice");
            const inspection = Bun.inspect(context);
            expect(inspection).toContain("SafeContext");
            expect(inspection).toContain("'name'");
        });

        it("Should hide keys in inspection", () => {
            const hiddenCtx = new SafeContext<Context>({ hideKeys: ["name"] });
            hiddenCtx.set("name", "Alice");
            hiddenCtx.set("count", 10);
            const inspection = Bun.inspect(hiddenCtx);
            expect(inspection).not.toContain("'name'");
            expect(inspection).toContain("'count'");
        });

        it("Should show active scoped values", () => {
            {
                using _ = context.with("name", "Scoped");
                expect(Bun.inspect(context)).toContain("'name'");
            }
        });
    });

    describe("Complex Interactions", () => {
        it("Should handle nested final states correctly", () => {
            context.set("name", "L1");
            {
                using _ = context.with("name", "L2", { final: true });
                expect(() => context.set("name", "L3")).toThrow(FinalOverrideError);
                expect(() => {
                    using __ = context.with("name", "L3");
                }).toThrow(FinalOverrideError);
            }
            expect(() => context.set("name", "L1-New")).not.toThrow();
        });
    });
});
