import { RentDayRepository } from './../rentDay/repository/rentDay.repository';
import { AutoRentRepository } from './repositories/autoRent.repository';
import { RentDayService } from './../rentDay/rentDay.service';
import { DbModule } from './../database/db.module';
import { AutoRentController } from './autoRent.controller';
import { AutoRentService } from './autoRent.service';
import { Module } from "@nestjs/common";

@Module({
    imports: [DbModule],
    providers: [AutoRentService, RentDayService, AutoRentRepository, RentDayRepository],
    controllers: [AutoRentController]
})
export class AutoRentModule {}