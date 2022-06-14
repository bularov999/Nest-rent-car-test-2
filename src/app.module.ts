import { AutoRentModule } from './autoRent/autoRent.module';
import { DbModule } from './database/db.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: ['.env']
  }),
  DbModule,
  AutoRentModule
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
