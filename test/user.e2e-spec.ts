import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserModule } from '../src/users/user.module';
import { UserEntity } from '../src/users/models/user.entity';
import * as request from 'supertest';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  const mockUserRepository = {};
  let mockUsers = [
    {
      id: '1',
      first_name: 'andrew',
      last_name: 'rockefeller',
      email: 'andrew@gmail.com',
      password: '123456',
    },
    {
      id: '2',
      first_name: 'bob',
      last_name: 'burman',
      email: 'bob@gmail.com',
      password: '123456',
    },
  ];
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
  it('/events/ (POST)', () => {
    return request(app.getHttpServer())
      .post('/events')
      .send({
        id: '3',
        title: 'mock party',
        desc: 'mock event for testing',
        start_time: new Date('November 17, 2023 16:00:00'),
        end_time: new Date('November 17, 2023 19:00:00'),
        location: 'columbia',
      })
      .expect('Content-Type', /json/)
      .expect(201)
      .then((response) => {
        expect(response.body).toEqual({
          message: 'insert successfully',
          mockUsers[0],
        });
      });
  });
});
