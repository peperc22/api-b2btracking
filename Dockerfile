FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# development
FROM base AS development
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "run", "dev"]

# prerelease & release stage
FROM base as prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
RUN bun run build

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/dist ./dist
COPY --from=prerelease /usr/src/app/package.json .

# run the app
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "run", "start"]
