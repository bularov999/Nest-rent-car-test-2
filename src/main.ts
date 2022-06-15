import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService>(ConfigService)
  const port = config.get('PORT')
  const configSwagger = new DocumentBuilder()
    .setTitle('Auto-rent')
    .setDescription('test-2')
    .setVersion('1.0')
    .addTag('rent')
    .build()
  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('api', app, document);
  await app.listen(port);
}
bootstrap();
