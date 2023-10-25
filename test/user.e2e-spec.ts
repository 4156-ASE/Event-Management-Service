import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserModule } from '../src/users/user.module';
import { UserEntity } from '../src/users/models/user.entity';
import * as request from 'supertest';
import { Entity, EntityNotFoundError } from 'typeorm';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let mockUsers = [
    {
      id: 1,
      first_name: 'andrew',
      last_name: 'rockefeller',
      email: 'andrew@gmail.com',
      password: '123456',
    },
    {
      id: 2,
      first_name: 'bob',
      last_name: 'burman',
      email: 'bob@gmail.com',
      password: '123456',
    },
    {
      id: 3,
      first_name: 'charlie',
      last_name: 'chaplin',
      email: 'test3@email.com',
      password: '123456',
    }
  ];
  const mockUserRepository = {
    findOne: jest.fn().mockImplementation((arg) => {
      // if arg has where.email field, return the user with that email
      if(arg.where.email) {
        for (const item of mockUsers) {
          if (item.email == arg.where.email) {
            return Promise.resolve(item);
          }
        }
      }
      else if (arg.where.id) {
        for (const item of mockUsers) {
          if (item.id == arg.where.id) {
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
      if(arg.where.email) {
        for (const item of mockUsers) {
          if (item.email == arg.where.email) {
            return Promise.resolve(item);
          }
        }
      }
      else if (arg.where.id) {
        for (const item of mockUsers) {
          if (item.id == arg.where.id) {
            return Promise.resolve(item);
          }
        }
      }
      return Promise.reject(new EntityNotFoundError(UserEntity, arg.where));
    }),
    update: jest.fn().mockImplementation((id, user) => {
      for (const item of mockUsers) {
        if (item.id == id) {
          Object.assign(item, user);
          return Promise.resolve(item);
        }
      }
      return Promise.reject(new EntityNotFoundError(UserEntity, id));
    }),
    delete: jest.fn().mockImplementation((id) => {
      for (let i = 0; i < mockUsers.length; i++) {
        if (mockUsers[i].id === id) {
          mockUsers.splice(i, 1);
          return Promise.resolve({ raw: [], affected: 1});
        }
      }
      return Promise.resolve({ raw: [], affected: 0});
    })
  };
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
    })
      .overrideProvider(getRepositoryToken(UserEntity))
      .useValue(mockUserRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users/register (POST) new email', () => {
    return request(app.getHttpServer())
      .post('/users/register')
      .send({
        first_name: 'testfirst',
        last_name: 'testlast',
        email: 'new@email.com',
        password: '123456'
      })
      .expect('Content-Type', /json/)
      .expect(201)
      .expect({
        message: 'User registered successfully',
      });
  });

  it('/users/register (POST) existing email', () => {
    return request(app.getHttpServer())
      .post('/users/register')
      .send({
        first_name: 'testfirst',
        last_name: 'testlast',
        email: 'test3@email.com',  // this email is already in the mockUsers array
        password: '123456'
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

  it('/users/login (POST) existing email', () => {
    return request(app.getHttpServer())
      .post('/users/login')
      .send({
        email: mockUsers[0].email,
        password: mockUsers[0].password
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({
        status: 'success',
        message: 'Logged in successfully',
        data: {
          user: {
            id: mockUsers[0].id,
            first_name: mockUsers[0].first_name,
            last_name: mockUsers[0].last_name,
            email: mockUsers[0].email,
          },
          token: 'alnlgsnsoajg',
          expires_in: 3600,
        },
      });
  });

  it('/users/login (POST) non-existing email', () => {
    return request(app.getHttpServer())
      .post('/users/login')
      .send({
        email: "nonexisting@email.com",
        password: "123456"
      })
      .expect('Content-Type', /json/)
      .expect(401)
      .expect({
        statusCode: 401,
        message: 'Invalid email or password',
      });
  });

  it('/users/login (POST) wrong password', () => {
    return request(app.getHttpServer())
      .post('/users/login')
      .send({
        email: mockUsers[0].email,
        password: "wrongpassword"
      })
      .expect('Content-Type', /json/)
      .expect(401)
      .expect({
        statusCode: 401,
        message: 'Invalid email or password',
      });
  });

  it('/users/:id (GET)', () => {
    const {password, ...user} = mockUsers[0];
    return request(app.getHttpServer())
      .get('/users/1')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(user);
  });

  it('/users/:id fail (GET)', () => {
    return request(app.getHttpServer())
      .get('/users/10')
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
      .send({
        first_name: 'newfirst',
        last_name: 'newlast',
        email: mockUsers[0].email
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
      .patch('/users/10')  // this id is not in the mockUsers array
      .send({
        first_name: 'newfirst',
        last_name: 'newlast',
        email: mockUsers[0].email
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
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({
        status: 200,
        message: 'User deleted successfully',
      });
  });

  it('/users/:id fail (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/users/10')  // this id is not in the mockUsers array
      .expect('Content-Type', /json/)
      .expect(404)
      .expect({
        statusCode: 404,
        message: 'User not found',
      });
  });
});
