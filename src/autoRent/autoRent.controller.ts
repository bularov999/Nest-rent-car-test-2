import { ResponseAutoReportInterface } from './../dto/responseAutoReport.dto';
import { RentDate } from './../dto/rentDate.dto';
import { AutoRentService } from './autoRent.service';
import { PG_CONNECTION } from './../constants/constants';
import { Body, Controller, Get, HttpException, Inject, Param, Post } from "@nestjs/common";

@Controller()
export class AutoRentController {
    constructor(@Inject(PG_CONNECTION) private conn: any, private readonly autoRentService: AutoRentService) { }
    @Post('car/:auto_id/rent')
    async postCar(@Param('auto_id') carId, @Body() body: RentDate): Promise<String | HttpException> {
        return await this.autoRentService.getAutoRent(carId, body)
    }

    @Get('report/:rent_month/rent')
    async getAutoReport(@Param('rent_month') rentMonth: string): Promise<ResponseAutoReportInterface> {
        const date = new Date(rentMonth)
        return await this.autoRentService.getAutoReport(date)
    }
    // mock migrations
    @Get('create-migration')
    async createMigrations() {
        const res = await this.conn.query(`
        CREATE TABLE Auto (
            auto_id int ,
            auto_number varchar(255),
            PRIMARY KEY (auto_id, auto_number),
            name varchar(255),
            is_block BOOLEAN,
            from_date TIMESTAMP,
            to_date TIMESTAMP
            );
            INSERT INTO Auto(auto_id, name, auto_number, is_block, from_date, to_date) 
            VALUES  (1, 'audi', '1111a' , FALSE, now(), NULL ),
                    (2, 'mercedes', '2222b',FALSE, now(),  NULL),
                    (3, 'honda', '3333c', FALSE, now(), NULL ),
                    (4, 'lexus', '4444e', FALSE, now(),  NULL),
                    (5, 'toyota', '5555r', FALSE, now(),  NULL);
            CREATE TABLE RentDays (
                        auto_id int,
                        auto_number varchar(255),
                        rent_date TIMESTAMP,
                        rent_days_in_one_month int,
                        FOREIGN KEY (auto_id, auto_number) REFERENCES Auto (auto_id, auto_number)
                    );
    `)
        return 'db was created'
    }
    // mock migrations delete
    @Get('drop-table')
    async dropTable() {
        const res = await this.conn.query(`DROP TABLE Auto, RentDays`)
        return 'db was deleted'
    }
}

