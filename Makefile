CI ?=
CI_IMAGE=ghcr.io/cars10/elasticvue_ci:latest

build_docker_ci:
	docker build -f docker/Dockerfile_ci -t ${CI_IMAGE} .

ci: build_docker_ci
	docker run --rm ${CI_IMAGE} yarn lint
	docker run --rm ${CI_IMAGE} yarn tsc
	docker run --rm ${CI_IMAGE} yarn test:unit
	docker run --rm -e CI="$(CI)" -v ./playwright-report-ci:/app/playwright-report ${CI_IMAGE} yarn test:e2e:all

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
