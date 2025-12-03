.DEFAULT_GOAL := help

help:
	@echo "Commandes disponibles :"
	@grep -E '^[a-zA-Z0-9_-]+:' Makefile | cut -d':' -f1

start:
	docker compose up -d

start-build:
	docker compose up --build -d

restart:
	docker compose stop
	docker compose up -d

stop:
	docker compose down

reset:
	docker compose down
	docker compose up --build -d

reset-volumes:
	docker compose down --volumes
	docker compose up --build -d

code:
	docker compose exec backend bash

log:
	docker compose logs --tail=50 -f backend
