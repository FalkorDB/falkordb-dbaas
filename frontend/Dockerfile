FROM node:20-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_INTEGRITY_KEYS=0
RUN corepack enable

WORKDIR /app

COPY package.json ./

RUN pnpm install

COPY . .

CMD ["pnpm", "run", "dev"]
