CI ?=

build_docker_ci:
	docker build -f docker/Dockerfile_ci -t elasticvue-ci .

ci: build_docker_ci
	docker run --rm -e CI="$(CI)" -v ./playwright-report-ci:/app/playwright-report elasticvue-ci yarn ci

build_tauri:
	yarn tauri:build

# Build docker image to run elasticvue served by nginx
build_docker_nginx:
	docker build -f docker/Dockerfile -t elasticvue .

# Build docker image to run elasticvue served by nginx MULTIARCH
build_docker_nginx_multiarch:
	docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t elasticvue -f docker/Dockerfile_multiarch .

# Build elasticvue browser extensions into ./artifacts via docker
build_browser_extensions:
	mkdir -p "$(CURDIR)/artifacts"
	docker build -f docker/Dockerfile_browser_ext -t elasticvue-build_browser_ext .
	docker run --rm -v "$(CURDIR)/artifacts":/app/artifacts elasticvue-build_browser_ext scripts/build_browser_extensions.sh

run_docker_nginx:
	docker run -p 8080:8080 elasticvue

e2e: build_docker_ci
	docker run --rm -v ./playwright-report-ci:/app/playwright-report elasticvue-ci yarn test:e2e $(TEST)
