import { describe, expect, test } from "bun:test";
import quietAsk from "../src";

type ToolDef = {
  name: string;
  renderCall: () => { render: (width: number) => string[] };
  renderResult: (
    result: unknown,
    options: unknown,
    theme: { fg: (tone: string, text: string) => string },
  ) => { render: (width: number) => string[] };
  execute: (
    id: string,
    params: unknown,
    signal: unknown,
    onUpdate: unknown,
    ctx: { invokeTool?: (params: unknown) => Promise<unknown> },
  ) => Promise<unknown>;
};

/** Stub zod builder: records nothing, satisfies the chained schema calls. */
function fakeZod(): Record<string, (...args: unknown[]) => unknown> {
  const node = () => {
    const n: Record<string, unknown> = {
      optional: () => n,
      min: () => n,
    };
    return (..._args: unknown[]) => n;
  };
  const z: Record<string, (...args: unknown[]) => unknown> = {};
  for (const method of ["object", "array", "string", "boolean", "number"]) {
    z[method] = node();
  }
  return z;
}

function register(): ToolDef {
  const tools: ToolDef[] = [];
  quietAsk({
    registerTool: (def: unknown) => tools.push(def as ToolDef),
    zod: fakeZod(),
  } as never);
  expect(tools.length).toBe(1);
  return tools[0];
}

const theme = { fg: (_tone: string, text: string) => text };

describe("quiet-ask extension", () => {
  test("shadows the built-in ask tool", () => {
    expect(register().name).toBe("ask");
  });

  test("execute delegates to the native built-in via ctx.invokeTool", async () => {
    const tool = register();
    const nativeResult = { content: [], details: { question: "Q" } };
    let received: unknown;
    const result = await tool.execute("id", { questions: [] }, undefined, undefined, {
      invokeTool: async (params) => {
        received = params;
        return nativeResult;
      },
    });
    expect(received).toEqual({ questions: [] });
    expect(result).toBe(nativeResult);
  });

  test("execute returns a clean error when the native tool is unavailable", async () => {
    const result = (await register().execute("id", {}, undefined, undefined, {})) as {
      isError: boolean;
    };
    expect(result.isError).toBe(true);
  });

  test("renderCall renders no lines while the dialog is open", () => {
    expect(register().renderCall().render(80)).toEqual([]);
  });

  test("renderResult renders the answered form", () => {
    const tool = register();
    const lines = tool.renderResult(
      { details: { question: "Q", options: ["A"], selectedOptions: ["A"] } },
      {},
      theme,
    ).render(80);
    expect(lines).toEqual(["Q", "● A"]);
  });
});
