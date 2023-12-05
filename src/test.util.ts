import { ClientEntity } from "./users/models/client.entity";
import { UserEntity } from "./users/models/user.entity";
import { EventEntity } from "./events/models/event.entity";
import { randomBytes, randomInt } from "crypto";

export const randomEmail = (domain = "test.com") => {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let email = "";
  for (let i = 0; i < 10; i++) {
    email += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return email + "@" + domain;
};
export const randomString = (length: number = 16) => {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
};
export const createClient = () => {
  return {
    cid: randomString(),
    client_token: randomString(),
    admin_email: randomEmail(),
  };
};
export const createUser = (client: ClientEntity, user_type: 'admin' | 'regular') => {
  return {
    pid: randomBytes(16).toString('hex'),
    client: client,
    first_name: randomString(),
    last_name: randomString(),
    user_type: user_type,
    email: randomEmail(),
  };
};
export const createEvent = (client: ClientEntity, host: UserEntity) => {
  return {
    eid: randomBytes(16).toString('hex'),
    client: client,
    host: host,
    title: randomString(),
    desc: randomString(),
    start_time: new Date("December 17, 2023 03:24:00"),
    end_time: new Date("December 17, 2023 04:24:00"),
    location: randomString(),
  };
};
export const createParticipant = (user: UserEntity, event: EventEntity, status: "pending" | "accept" | "reject") => {
  return {
    id: randomInt(1, 1000),
    user: user,
    event: event,
    status: status,
  };
};