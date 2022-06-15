import { RentDayRepository } from './repository/rentDay.repository';
import { RentDayService } from './rentDay.service';
import { RentDayController } from './rentDay.controller';
import { DbModule } from './../database/db.module';
import { Module } from "@nestjs/common";

@Module({
    imports: [DbModule],
    controllers: [RentDayController],
    providers: [RentDayService, RentDayRepository]
})

export class RentDayModule {}