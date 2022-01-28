build:
	docker build . -t base-3djs
start:
	docker run --rm -d -v $(PWD)/app:/app -p 8093:8080 -p 8003:8000 --name 3djs base-3djs
enter:
	docker exec -it -u workspace 3djs bash
stop:
	docker stop 3djs
