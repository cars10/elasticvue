.PHONY: docker

dev:
	yarn dev

docker:
	docker build -f docker/Dockerfile -t elasticvue .
