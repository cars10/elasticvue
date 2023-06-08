.PHONY: docker

dev:
	yarn dev

docker:
	docker build -f docker/Dockerfile -t elasticvue .

test:
	yarn test:e2e:all

lint:
	yarn lint

tsc:
	yarn tsc

ci: tsc lint test