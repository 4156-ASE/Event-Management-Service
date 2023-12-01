FROM node:18-alpine as installer

# ENV NODE_ENV build

WORKDIR /home/node

# COPY . /home/node

RUN npm install -g pnpm
COPY package*.json ./
RUN pnpm install

# --
FROM installer as runner

COPY . /home/node

USER node
WORKDIR /home/node

CMD [ "pnpm", "run", "start:dev" ]