import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as moduleAlias from 'module-alias';

function initAlias() {
  moduleAlias.addAliases({
    '@/(.*)': '<rootDit>/$1',
  });
}

initAlias();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
