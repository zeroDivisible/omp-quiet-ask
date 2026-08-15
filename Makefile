.PHONY: help test build install unlink

help: ## Show available targets
	@grep -hE '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}{printf "  \033[1m%-10s\033[0m %s\n", $$1, $$2}'

test: ## Run the test suite (bun test)
	bun test

build: ## Typecheck (omp loads TS directly; no emit)
	bun run build

install: ## Link this repo as an omp plugin
	omp plugin link $(CURDIR)

unlink: ## Remove the omp plugin link
	omp plugin uninstall omp-quiet-ask
