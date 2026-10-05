# ASK Robotic — Railway imajı: Next.js (standalone) + derleme servisi (arduino-cli, AVR) + migrasyon/tohumlama girişi.
FROM node:20-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @ask/db build && pnpm --filter @ask/sim build
RUN pnpm --filter web build
# Migrasyon/tohumlama için yalnız üretim bağımlılıklarıyla taşınabilir db paketi
RUN pnpm --filter @ask/db --prod deploy --legacy /deploy-db \
 && cp -r packages/db/migrations /deploy-db/migrations

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl \
 && rm -rf /var/lib/apt/lists/*

# arduino-cli + AVR çekirdeği + izin listesindeki kütüphaneler (apps/web/src/lib/compile/validate.ts ALLOWED_HEADERS)
ARG ARDUINO_CLI_VERSION=1.2.0
ENV ARDUINO_DIRECTORIES_DATA=/opt/arduino/data \
    ARDUINO_DIRECTORIES_USER=/opt/arduino/user \
    ARDUINO_DIRECTORIES_DOWNLOADS=/opt/arduino/downloads \
    ARDUINO_CLI=/usr/local/bin/arduino-cli
RUN curl -fsSL "https://github.com/arduino/arduino-cli/releases/download/v${ARDUINO_CLI_VERSION}/arduino-cli_${ARDUINO_CLI_VERSION}_Linux_64bit.tar.gz" \
    | tar -xz -C /usr/local/bin arduino-cli \
 && arduino-cli core update-index \
 && arduino-cli core install arduino:avr@1.8.6 \
 && arduino-cli lib install "Servo@1.3.0" "LiquidCrystal@1.0.7" "LiquidCrystal I2C@1.1.2" "DHT sensor library@1.4.6" \
      "Adafruit Unified Sensor@1.1.15" "Adafruit BusIO@1.17.4" "Adafruit BMP280 Library@3.0.0" "Adafruit GFX Library@1.12.4" \
      "Adafruit SSD1306@2.5.16" "RTClib@2.1.4" "Keypad@3.1.1" "NewPing@1.9.7" "MFRC522@1.4.12" "IRremote@4.5.0" \
      "SD@1.3.0" "VL53L0X@1.3.1" \
 && rm -rf /opt/arduino/downloads \
 && chown -R node:node /opt/arduino

COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=node:node /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=node:node /deploy-db /app/deploy-db
COPY --chown=node:node docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh
USER node
ENV PORT=3000 HOSTNAME=0.0.0.0 COMPILE_ENABLED=true
EXPOSE 3000
CMD ["/app/docker-entrypoint.sh"]
