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

TUNNEL_URL = http://tunnel.nbshtech.ru:8001

# frp tunnel for Telegram testing (uses .frpc.toml)
tunnel:
	@echo "==> Mini App URL: $(TUNNEL_URL) (paste this into BotFather)"
	frpc -c .frpc.toml

# Full Telegram-ready stack: emulators + bot + tunnel
dev-tg: .env .frpc.toml
	@trap 'kill 0' EXIT; \
		cd backend/functions && npm run build:watch & \
		$(FIREBASE) emulators:start $(EMU_FLAGS) & \
		sleep 3 && node bot/index.js & \
		sleep 2 && echo "" && echo "Mini App URL: $(TUNNEL_URL)" && frpc -c .frpc.toml & \
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