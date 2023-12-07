# Event Management Service
## Description

A a backend service for event management that facilitates the creation, management, and eventual automatic deletion of events.

The frontend client part is: https://github.com/4156-ASE/Event-Management-Frontend.

The backend service uses this event management service and supply APIs to front client is: https://github.com/4156-ASE/Event-Management-Backend
\``
## Start Docker
We use docker for our service, you can use docker-compose to start the service in dev module without installing the dependencies.

```bash
$ sudo docker-compose up --build

```


## API Documentation

[Swagger API Documentation](https://app.swaggerhub.com/apis-docs/dearalina/4156-Project/1.0.0)

## Installation

```bash
$ pnpm install
```

## Running the service

```bash
# development
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

### E2E Checklist
Test Checklist:

- [ ] Register.
  - [ ] Register at /signup.
    - [ ] Failed to sign up while password not between 8-20 chars.
    - [ ] Failed to sign up while email input not an email. 
    - [ ] Failed to sign up while email existed in database.
    - [ ] Success to sign up.
    - [ ] Redirect to signin page.
- [ ] Login.
  - [ ] Login at /signin.
    - [ ] Failed to login with wrong email.
    - [ ] Failed to login with wrong password.
    - [ ] Cannot click 'Log in' button without checking 'I have read and agree to the terms of service' checkbox.
    - [ ] Success to login.
- [ ] Logout.
  - [ ] Hover 'User' at top-right corner. See dropdown list.
  - [ ] Click 'Logout' at dropdown list.
  - [ ] Redirect to signin page.
- [ ] Create an event.
  - [ ] Enter events page /events.
  - [ ] Click 'Reserve a seat!' at top-right cornet.
  - [ ] Fill out reservation form at /create.
    - [ ] Click 'Create' Button to create.
    - [ ] Click 'Back' Button back to events page.
- [ ] Check an event.
  - [ ] User could see events at /events as a host.
  - [ ] User could see 'Detail' and 'Delete' buttons in operations column as a host.
  - [ ] User could see events at /events as a participant.
  - [ ] User could see 'Detail' button in operations column as a participant.
  - [ ] 
- [ ] Edit an event.
  - [ ] Enter events page /events.
  - [ ] Choose one event and click 'Detail' Button.
  - [ ] Fill out reservation form.
  - [ ] Click 'Save' to save changed content.
- [ ] Delete an event as a host.
  - [ ] Enter events page /events.
  - [ ] Choose one event and click 'Delete' Button.
  - [ ] Click 'Confirm' button at popup modal.
- [ ] Invite participant.
  - [ ] Recreate another account.
  - [ ] Enter events page /events.
  - [ ] Choose one event and click 'Detail' Button.
  - [ ] Click '+' Button blow text 'Participants'.
    - [ ] Enter participant's email to modal input and Click 'Add' button. See new participant blow text 'Participants'
    - [ ] Enter wrong email and Click 'Add' button. See wrong toast appear.
- [ ] Check participant.
  - [ ] Enter events page /events.
  - [ ] Choose one event and click 'Detail' Button.
  - [ ] Hover to participant avatar and see dropdown list.
  - [ ] Click 'Detail' Button in dropdown list. See participant detail. Including id, email, lastname, firstname of the participant.
- [ ] Remove participant.
  - [ ] Enter events page /events.
  - [ ] Choose one event and click 'Detail' Button.
  - [ ] Hover to participant avatar and see dropdown list.
  - [ ] Click 'Remove' Button in dropdown list. See participant removed.
- [ ] Transfer host to participant.
  - [ ] Enter events page /events.
  - [ ] Choose one event and click 'Detail' Button.
  - [ ] Hover to participant avatar and see dropdown list.
  - [ ] Click 'Transfer Host' Button in dropdown list. See host and participants changed.



## Linting and analyzing bugs statically

```bash
# Lint and autofix with eslint
$ pnpm run lint

```


