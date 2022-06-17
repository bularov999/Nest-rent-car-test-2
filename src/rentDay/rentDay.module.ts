import { AutoRentRepository } from './../autoRent/repositories/autoRent.repository';
import { AutoRentService } from './../autoRent/autoRent.service';
import { RentDayRepository } from './repository/rentDay.repository';
import { RentDayService } from './rentDay.service';
import { RentDayController } from './rentDay.controller';
import { DbModule } from './../database/db.module';
import { Module } from "@nestjs/common";

@Module({
    imports: [DbModule],
    controllers: [RentDayController],
    providers: [RentDayService, RentDayRepository, AutoRentService, AutoRentRepository]
})

export class RentDayModule {}