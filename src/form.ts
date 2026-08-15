/**
 * Pure rendering logic for the answered ask form, extracted so it can be
 * tested without a live omp session.
 *
 * `fg` colors a line: the theme's `fg(tone, text)` in the TUI, identity in
 * tests. Returns one line per rendered row.
 */
export function formLines(
  details: unknown,
  fg: (tone: "accent" | "muted", text: string) => string,
): string[] {
  const d = details as Record<string, unknown> | undefined;
  const questions = (
    Array.isArray(d?.results) ? d!.results : d?.question ? [d!] : []
  ) as Record<string, unknown>[];
  const lines: string[] = [];
  questions.forEach((q, i) => {
    if (i) lines.push("");
    lines.push(String(q.question));
    const selected = new Set((q.selectedOptions as string[]) ?? []);
    for (const opt of (q.options as unknown[]) ?? []) {
      const label =
        typeof opt === "string"
          ? opt
          : String((opt as { label?: unknown }).label);
      const on = selected.has(label);
      const marker = q.multi ? (on ? "☑" : "☐") : on ? "●" : "○";
      lines.push(fg(on ? "accent" : "muted", `${marker} ${label}`));
    }
  });
  return lines;
}
