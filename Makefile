.PHONY: dev format lint build preview clean generate feature help

PNPM := pnpm
# Prefer Volta (package.json pins node 20.x) over broken Homebrew node@14 in PATH
NODE := $(shell command -v volta >/dev/null 2>&1 && volta which node 2>/dev/null || command -v node 2>/dev/null || echo node)

help:
	@echo "Available targets:"
	@echo "  make dev              - Start Vite dev server (development mode)"
	@echo "  make format           - Run Prettier + ESLint --fix"
	@echo "  make lint             - Run ESLint + TypeScript check (no writes)"
	@echo "  make build            - Format, type-check, and production build"
	@echo "  make preview          - Serve production build locally"
	@echo "  make clean            - Remove dist, .turbo, node_modules/.vite"
	@echo "  make generate name=X [out=PATH] - Scaffold your app from this template (default: ../X)"
	@echo "  make feature name=X [scope=full|hook|page] [label=\"Name\"] [label-id=\"Nama\"] - Scaffold page (name spaces → camelCase key, e.g. abc def → abcDef)"

dev:
	@if [ ! -d node_modules ]; then \
		echo ""; \
		echo "  node_modules not found — run pnpm install first."; \
		echo ""; \
		echo "    pnpm install"; \
		echo "    make dev"; \
		echo ""; \
		exit 1; \
	fi
	$(PNPM) run dev

format:
	$(PNPM) run format

lint:
	$(PNPM) run lint

build: format
	$(PNPM) run build

preview:
	$(PNPM) run preview

clean:
	rm -rf dist .turbo node_modules/.vite

generate:
ifndef name
	$(error Usage: make generate name=<app-name> [out=<path>])
endif
	@$(NODE) scripts/generate-app.mjs --name=$(name) $(if $(out),--out=$(out),)

feature:
ifndef name
	$(error Usage: make feature name=<feature-name> [scope=full|hook|page] [label="Display Name"] [label-id="Nama Tampilan"])
endif
	@$(NODE) scripts/generate-feature.mjs --name="$(name)" $(if $(scope),--scope="$(scope)",) $(if $(label),--label="$(label)",) $(if $(label-id),--label-id="$(label-id)",)
