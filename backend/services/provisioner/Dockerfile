FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ARG SERVICE_PATH=""
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN cd $SERVICE_PATH && pnpm run build

FROM base
COPY --from=prod-deps /app/$SERVICE_PATH/node_modules /app/node_modules
COPY --from=build /app/dist/$SERVICE_PATH /app/dist

ENV PORT=3000
EXPOSE 3000

CMD pnpm run serve