import { AutoRentRepository } from './repositories/autoRent.repository';
import { DbModule } from './../database/db.module';
import { AutoRentService } from './autoRent.service';
import { Module } from "@nestjs/common";

@Module({
    imports: [DbModule],
    providers: [AutoRentService, AutoRentRepository],
})
export class AutoRentModule {}