start:
	docker compose up -d

restart:
	docker compose stop
	docker compose up -d

stop:
	docker compose down

reset:
	docker compose down --volumes
	docker compose up --build -d

code : 
	docker compose exec backend bash

log :
	docker compose logs --tail=50 -f backend