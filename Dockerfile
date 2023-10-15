FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app


# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
RUN npm install -g pnpm
COPY package*.json ./
RUN pnpm install
# If you are building your code for production
# RUN pnpm ci --omit=dev

# Bundle app source
COPY . .

EXPOSE 8080

CMD [ "pnpm", "run", "start:dev" ]