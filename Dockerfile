FROM node:18-alpine as installer

WORKDIR /home/node

RUN npm install -g pnpm
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install

# --
FROM installer as runner

WORKDIR /home/node
COPY . /home/node

CMD [ "pnpm", "run", "start:dev" ]