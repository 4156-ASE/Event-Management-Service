# Event Management Service
## Description

A a backend service for event management that facilitates the creation, management, and eventual automatic deletion of events.

## Start Docker
We use docker for our service, you can use docker-compose to start the service in dev module without installing the dependencies.

```bash
$ sudo docker-compose up --build

```

## API Documentation

[Swagger API Docmentation](https://app.swaggerhub.com/apis-docs/dearalina/4156-Project/1.0.0)

## Installation

```bash
$ pnpm install
```

## Running the service

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Build the service

```bash
# development
$ pnpm build
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Linting and formatting

```bash
# Lint and autofix with eslint
$ pnpm run lint

# Format with prettier
$ pnpm run format

```


