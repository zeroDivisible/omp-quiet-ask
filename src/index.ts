import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import { formLines } from "./form";

/**
 * Quiet ask: shadows the built-in `ask` tool.
 * While the interactive dialog is open, nothing is rendered into the
 * transcript. After answering, the form is rendered once with the
 * selection marked. Execution is fully delegated to the native built-in
 * via ctx.invokeTool, so dialog behavior, timeouts, and result details
 * are the native tool's own.
 */
export default function quietAsk(pi: ExtensionAPI) {
  const z = pi.zod;

  pi.registerTool({
    name: "ask",
    label: "Ask",
    description:
      "Prompts the interactive user for one or more option-picker or free-form answers. Use when the user must decide between approaches with materially different tradeoffs. Provide 2-5 concise options. The runtime adds its own controls; do not use reserved labels: 'Other (type your own)', 'Chat about this', 'Next →'.",
    parameters: z.object({
      questions: z
        .array(
          z.object({
            id: z.string(),
            question: z.string(),
            options: z.array(
              z.object({
                label: z.string(),
                description: z.string().optional(),
                preview: z.string().optional(),
              }),
            ),
            header: z.string().optional(),
            multi: z.boolean().optional(),
            recommended: z.number().optional(),
          }),
        )
        .min(1),
    }),
    strict: true,
    execute(_id, params, _signal, _onUpdate, ctx) {
      return ctx.invokeTool!(params as Record<string, unknown>);
    },
    renderCall() {
      return { render: () => [] as string[] };
    },
    renderResult(result, _options, theme) {
      return {
        render: () =>
          formLines(result.details, (tone, text) => theme.fg(tone, text)),
      };
    },
  });
}
