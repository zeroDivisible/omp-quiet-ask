# omp-quiet-ask

An [omp](https://github.com/) (Oh My Pi) extension that stops the `ask` tool
from rendering its question twice.

## What it does

Without this extension, an `ask` call renders the question/options block into
the transcript while the arguments stream, and then opens the interactive
form — so you read the question twice. This extension shadows the built-in
`ask` tool and changes only the rendering:

- While the dialog is open: nothing is added to the transcript.
- After you answer: the form is rendered once, with your selection marked
  (`●`/`○` for single-select, `☑`/`☐` for multi-select, selected line in the
  theme accent color).

Execution is delegated unchanged to the native built-in via `ctx.invokeTool`,
so dialog behavior, timeouts, notifications, and the result the model receives
are all native.

## Install

Link the repo as a plugin (loads via the `omp.extensions` manifest in
`package.json`):

```sh
git clone <this repo> && cd omp-quiet-ask
omp plugin link .
```

Restart omp afterwards. Alternatively, copy `src/index.ts` to
`~/.omp/agent/extensions/quiet-ask.ts`, or point the `extensions:` setting at
`./src/index.ts`.

## Disable

```sh
omp plugin disable omp-quiet-ask   # or delete the copied file
```

## Develop

```sh
bun install
make test   # unit + contract tests
make build  # typecheck only — omp loads TypeScript directly
```

- `src/index.ts` — the extension (tool shadow + renderers)
- `src/form.ts` — pure form-rendering logic, theme-agnostic
- `test/` — `bun test` suites for both

## Caveats

- Custom typed answers (`Other`) reach the model but are not shown in the
  rendered form.
- The tool description shown to the model is a faithful paraphrase of the
  native prompt, not the original text.
- The native `concurrency: "exclusive"` flag is not inherited: two `ask`
  calls issued in one batch would clobber the shared selector surface.
