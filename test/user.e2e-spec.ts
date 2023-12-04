import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserModule } from '../src/users/user.module';
import { UserEntity } from '../src/users/models/user.entity';
import * as request from 'supertest';
import { EntityNotFoundError } from 'typeorm';
import { ClientEntity } from 'src/users/models/client.entity';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  const mockClient: ClientEntity[] = [
    {
      cid: '1',
      client_token: 'token',
      admin_email: 'admin@example.com',
    },
  ];
  const mockUsers = [
    {
      pid: '1',
      client: mockClient[0],
      first_name: 'andrew',
      last_name: 'rockefeller',
      email: 'andrew@gmail.com',
      user_type: 'admin' as 'admin' | 'regular',
    },
    {
      pid: '2',
      client: mockClient[0],
      first_name: 'bob',
      last_name: 'burman',
      email: 'bob@gmail.com',
      user_type: 'admin' as 'admin' | 'regular',
    },
    {
      pid: '3',
      client: mockClient[0],
      first_name: 'charlie',
      last_name: 'chaplin',
      email: 'test3@email.com',
      user_type: 'admin' as 'admin' | 'regular',
    },
  ];
  const mockClientRepository = {
    findOne: jest.fn().mockImplementation((arg) => {
      if (arg.where.client_token === mockClient[0].client_token) {
        return Promise.resolve(mockClient);
      }
      return Promise.resolve(null);
    }),
    save: jest.fn().mockImplementation((client) => {
      if (client.cid) {
        for (const item of mockClient) {
          if (item.cid == client.cid) {
            Object.assign(item, client);
            return Promise.resolve(item);
          }
        }
      } else {
        const new_client = {
          cid: `mock_cid_${mockClient.length + 1}`,
          ...client,
        };
        mockClient.push(new_client);
        return Promise.resolve(new_client);
      }
    }),
    update: jest.fn().mockImplementation((cid, client) => {
      for (const item of mockClient) {
        if (item.cid == cid) {
          Object.assign(item, client);
          return Promise.resolve(item);
        }
      }
      return Promise.reject(new EntityNotFoundError(ClientEntity, cid));
    }),
    delete: jest.fn().mockImplementation((cid) => {
      const index = mockClient.findIndex((item) => item.cid === cid);
      if (index > -1) {
        mockClient.splice(index, 1);
        return Promise.resolve({ raw: [], affected: 1 });
      }
      return Promise.resolve({ raw: [], affected: 0 });
    }),
  };
  const mockUserRepository = {
    findOne: jest.fn().mockImplementation((arg) => {
      // if arg has where.email field, return the user with that email
      if (arg.where.email) {
        for (const item of mockUsers) {
          if (item.email == arg.where.email) {
            return Promise.resolve(item);
          }
        }
      } else if (arg.where.pid) {
        for (const item of mockUsers) {
          if (item.pid == arg.where.pid) {
            return Promise.resolve(item);
          }
        }
      }
      return Promise.resolve(null);
    }),
    save: jest.fn().mockImplementation((user) => {
      return Promise.resolve(user);
    }),
    findOneOrFail: jest.fn().mockImplementation((arg) => {
      // if arg has where.email field, return the user with that email
      if (arg.where.email) {
        for (const item of mockUsers) {
          if (item.email == arg.where.email) {
            return Promise.resolve(item);
          }
        }
      } else if (arg.where.pid) {
        for (const item of mockUsers) {
          if (item.pid == arg.where.pid) {
            return Promise.resolve(item);
          }
        }
      }
      return Promise.reject(new EntityNotFoundError(UserEntity, arg.where));
    }),
    update: jest.fn().mockImplementation((pid, user) => {
      for (const item of mockUsers) {
        if (item.pid == pid) {
          Object.assign(item, user);
          return Promise.resolve(item);
        }
      }
      return Promise.reject(new EntityNotFoundError(UserEntity, pid));
    }),
    delete: jest.fn().mockImplementation((pid) => {
      for (let i = 0; i < mockUsers.length; i++) {
        if (mockUsers[i].pid === pid) {
          mockUsers.splice(i, 1);
          return Promise.resolve({ raw: [], affected: 1 });
        }
      }
      return Promise.resolve({ raw: [], affected: 0 });
    }),
  };
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
    })
      .overrideProvider(getRepositoryToken(UserEntity))
      .useValue(mockUserRepository)
      .overrideProvider(getRepositoryToken(ClientEntity))
      .useValue(mockClientRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users/register (POST) existing email', () => {
    return request(app.getHttpServer())
      .post('/users/register')
      .set('authorization', 'token')
      .send({
        first_name: 'testfirst',
        last_name: 'testlast',
        email: 'test3@email.com', // this email is already in the mockUsers array
        user_type: 'admin' as 'admin' | 'regular',
      })
      .expect('Content-Type', /json/)
      .expect(409)
      .expect({
        statusCode: 409,
        message: 'User with this email already exists',
      });
    // .then((response) => {
    //   expect(response.body).({
    //     statusCode: 409,
    //     message: 'User with this email already exists',
    //     error: 'Conflict',
    //   });
    // });
  });

  it('/users/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/users/1')
      .set('authorization', 'token')
      .expect('Content-Type', /json/)
      .expect(200);
  });

  it('/users/:id fail (GET)', () => {
    return request(app.getHttpServer())
      .get('/users/10')
      .set('authorization', 'token')
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({
        statusCode: 404,
        message: 'User not found',
      });
  });

  it('/users/:id (PATCH)', () => {
    return request(app.getHttpServer())
      .patch('/users/1')
      .set('authorization', 'token')
      .send({
        first_name: 'newfirst',
        last_name: 'newlast',
        email: mockUsers[0].email,
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({
        status: 200,
        message: 'User updated successfully',
      });
  });

  it('/users/:id fail (PATCH)', () => {
    return request(app.getHttpServer())
      .patch('/users/10') // this id is not in the mockUsers array
      .set('authorization', 'token')
      .send({
        first_name: 'newfirst',
        last_name: 'newlast',
        email: mockUsers[0].email,
      })
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({
        statusCode: 404,
        message: 'User not found',
      });
  });

  it('/users/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/users/1')
      .set('authorization', 'token')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({
        status: 200,
        message: 'User deleted successfully',
      });
  });

  it('/users/:id fail (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/users/10') // this id is not in the mockUsers array
      .set('authorization', 'token')
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({
        statusCode: 404,
        message: 'User not found',
      });
  });
});
