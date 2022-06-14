import { DbModule } from './../database/db.module';
import { AutoRentController } from './autoRent.controller';
import { AutoRentService } from './autoRent.service';
import { Module } from "@nestjs/common";

@Module({
    imports: [DbModule],
    providers: [AutoRentService],
    controllers: [AutoRentController]
})
export class AutoRentModule {}