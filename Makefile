.PHONY: start start-hot bot dev tunnel clean deploy

FIREBASE = ./node_modules/.bin/firebase
EMU_FLAGS = --import=./.firebase-data --export-on-exit

# Full local stack: web app + bot polling
dev: .env
	@trap 'kill 0' EXIT; \
		cd backend/functions && npm run build:watch & \
		$(FIREBASE) emulators:start $(EMU_FLAGS) & \
		sleep 5 && node bot/index.js & \
		wait

start: node_modules backend/functions/node_modules .env
	npm run build
	@echo "==> http://localhost:5000"
	$(FIREBASE) emulators:start $(EMU_FLAGS)

start-hot: node_modules backend/functions/node_modules .env
	@echo "==> http://localhost:5000"
	@trap 'kill 0' EXIT; \
		cd backend/functions && npm run build:watch & \
		$(FIREBASE) emulators:start $(EMU_FLAGS)

# ngrok tunnel for Telegram testing
tunnel:
	@echo "==> Copy the https://...ngrok-free.app URL into BotFather"
	ngrok http 5000

# Full Telegram-ready stack: emulators + bot + tunnel
dev-tg: .env
	@trap 'kill 0' EXIT; \
		cd backend/functions && npm run build:watch & \
		$(FIREBASE) emulators:start $(EMU_FLAGS) & \
		sleep 3 && node bot/index.js & \
		sleep 2 && echo "" && ngrok http 5000 & \
		wait
bot: .env
	@echo "==> Polling @$(shell grep TELEGRAM_BOT_USERNAME .env | cut -d= -f2)"
	node bot/index.js

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
	$(FIREBASE) deploy

clean:
	rm -rf node_modules backend/functions/node_modules backend/functions/lib

# Also clean emulator data
clean-data:
	rm -rf .firebase-data