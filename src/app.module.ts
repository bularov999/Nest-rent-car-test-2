import { RentDayRepository } from './rentDay/repository/rentDay.repository';
import { AutoRentRepository } from './autoRent/repositories/autoRent.repository';
import { AutoRentService } from './autoRent/autoRent.service';
import { RentDayService } from './rentDay/rentDay.service';
import { RentDayModule } from './rentDay/rentDay.module';
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
    envFilePath: ['.env.local' , 'env']
  }),
  DbModule,
  AutoRentModule,
  RentDayModule
],
  controllers: [AppController],
  providers: [AppService, RentDayService, RentDayRepository, AutoRentService, AutoRentRepository],
})
export class AppModule {}
