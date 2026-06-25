.PHONY: all lint typecheck test build webapp package dist verify clean help

all: verify

lint:
	npm run lint

typecheck:
	npm run typecheck

test:
	npm run test

build: webapp

webapp:
	npm run build:webapp

package: dist

dist:
	npm run package

verify:
	npm run verify

clean:
	npm run clean

help:
	@echo "Compatibility wrapper for the Node-based WebApp-only workflow."
	@echo "Use one of: lint, typecheck, test, webapp, dist, verify, clean"
