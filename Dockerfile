FROM node:18-alpine as installer

# ENV NODE_ENV build

WORKDIR /home/node

# COPY . /home/node

RUN npm install -g pnpm
COPY package*.json ./
RUN pnpm install

FROM installer as builder

# WORKDIR /home/node
COPY . /home/node

RUN pnpm build
# ---

FROM node:18-alpine as runner

ENV NODE_ENV production

USER node
WORKDIR /home/node

COPY --from=builder /home/node/package*.json /home/node/
COPY --from=builder /home/node/node_modules/ /home/node/node_modules/
COPY --from=builder /home/node/dist/ /home/node/dist/

CMD ["node", "dist/main.js"]