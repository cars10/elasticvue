CI ?=
TAURI_SIGNING_PRIVATE_KEY ?=
TAURI_SIGNING_PRIVATE_KEY_PASSWORD ?=
UID := $(shell id -u)
TAG ?=
FLATPAK_ID := com.elasticvue.Elasticvue
FLATPAK_IMAGE := ghcr.io/flathub-infra/flatpak-github-actions:gnome-51

dev:
	docker compose -f compose.yml up --build

lint:
	docker compose -f compose.yml run --rm elasticvue npm run check

build_docker_ci:
	docker build --platform linux/amd64 -f docker/Dockerfile_ci -t elasticvue-ci .

ci: build_docker_ci
	docker run --platform linux/amd64 --rm -e CI="$(CI)" -v ./playwright-report-ci:/app/playwright-report elasticvue-ci npm run ci

# https://github.com/tauri-apps/tauri/issues/8929
build_tauri:
	NO_STRIP=true npm run tauri:build -- --verbose

build_docker_tauri:
	docker build -t elasticvue-linux-tauri -f docker/Dockerfile_tauri --build-arg USERID="$(UID)" .
	docker run --rm \
			   -e TAURI_SIGNING_PRIVATE_KEY="$(TAURI_SIGNING_PRIVATE_KEY)" \
			   -e TAURI_SIGNING_PRIVATE_KEY_PASSWORD="$(TAURI_SIGNING_PRIVATE_KEY_PASSWORD)" \
			   -v .:/app \
			   elasticvue-linux-tauri bash -c "npm install && . ~/.cargo/env && rm -rf src-tauri/target/* && npm run tauri:build"

# Generate the flatpak manifest and its offline sources into ./flatpak/build, uses the working tree or a release with TAG=v1.2.3
flatpak_sources:
	docker run --rm -u "$(UID)" -e HOME=/tmp -e TAG="$(TAG)" -v "$(CURDIR)":"$(CURDIR)" -w "$(CURDIR)" $(FLATPAK_IMAGE) scripts/flatpak_sources.sh

# Build ./flatpak/build/elasticvue.flatpak the same way flathub does and run the flathub linter
build_flatpak: flatpak_sources
	docker run --rm --privileged -v "$(CURDIR)":"$(CURDIR)" -w "$(CURDIR)/flatpak/build" $(FLATPAK_IMAGE) sh -c "\
		flatpak-builder --force-clean --disable-rofiles-fuse --install-deps-from=flathub --repo=repo app $(FLATPAK_ID).yml && \
		flatpak build-bundle repo elasticvue.flatpak $(FLATPAK_ID) && \
		flatpak-builder-lint manifest $(FLATPAK_ID).yml; \
		flatpak-builder-lint repo repo; \
		chown -R $(UID) ."

# Build docker image to run elasticvue served by nginx
build_docker_nginx:
	docker build -f docker/Dockerfile_nginx -t elasticvue .

# Build docker image to run elasticvue served by nginx MULTIARCH
build_docker_nginx_multiarch:
	docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t elasticvue -f docker/Dockerfile_multiarch .

# Build elasticvue browser extensions into ./artifacts via docker
build_browser_extensions:
	mkdir -p "$(CURDIR)/artifacts"
	docker build -f docker/Dockerfile_browser_ext -t elasticvue-build_browser_ext --build-arg USERID="$(UID)" .
	docker run --rm -v "$(CURDIR)/artifacts":/app/artifacts elasticvue-build_browser_ext scripts/build_browser_extensions.sh

run_docker_nginx:
	docker run -p 8080:8080 elasticvue

test: build_docker_ci
	docker run --rm -v ./playwright-report-ci:/app/playwright-report elasticvue-ci sh -c "npm run test:unit && npm run test:e2e -- $(TEST)"

beta: build_docker_nginx
	docker tag elasticvue cars10/elasticvue:beta
	docker push cars10/elasticvue:beta

# Seed elasticsearch clusters and create website screenshots, extension screenshots and feature videos in scripts/showcase/output
showcase:
	scripts/showcase/run.sh $(TARGETS)
