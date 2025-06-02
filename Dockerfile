FROM oven/bun:1.2.10


WORKDIR /app


# Copy dependency files and install dependencies
COPY package.json ./
RUN bun install


# Copy the rest of your monorepo
COPY . .


EXPOSE 3000
EXPOSE 3001


CMD ["bun", "run", "dev:all"]

