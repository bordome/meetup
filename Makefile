.PHONY: start start-hot build clean deploy

EMU_FLAGS = --import=./.firebase-data --export-on-exit

start: node_modules backend/functions/node_modules .env
	npm run build
	@echo "==> http://localhost:5000"
	firebase emulators:start $(EMU_FLAGS)

start-hot: node_modules backend/functions/node_modules .env
	@echo "==> http://localhost:5000"
	@trap 'kill 0' EXIT; \
		cd backend/functions && npm run build:watch & \
		firebase emulators:start $(EMU_FLAGS)

build:
	cd backend/functions && npm run build

node_modules:
	npm install

backend/functions/node_modules:
	cd backend/functions && npm install

.env:
	cp .env.example .env
	@echo ".env created from .env.example — fill in secrets"

deploy:
	npm run build
	firebase deploy

clean:
	rm -rf node_modules backend/functions/node_modules backend/functions/lib
