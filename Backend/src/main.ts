import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/exception-filter/http-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setVersion('1.0')
    .setTitle('Twiiter/X wall of Love')
    .setDescription('Use api http://localhost:3000')
    .addServer('http://localhost:3000')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(
    session({
      secret:
        '95e75440082e51fd0ce4ef479e3cfec396fe7941a0e503375cd6ed23b2aba944', // Replace with a strong secret
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }, // Set `true` if using HTTPS
    }),
  );

  app.use(cookieParser());
  app.enableCors();
  // app.enableCors({ origin: 'http://localhost:3000', credentials: true });
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
