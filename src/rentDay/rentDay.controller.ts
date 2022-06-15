import { ResponseAutoReportInterface } from './dto/responseAutoReport.dto';
import { RentDayService } from './rentDay.service';
import { Controller, Get, Param } from "@nestjs/common";
import { ApiParam } from '@nestjs/swagger';

@Controller()
export class RentDayController {
    constructor(private readonly rentDayService: RentDayService) {}

    @ApiParam({name: 'rent_month'})
    @Get('report/:rent_month/rent')
    async getAutoReport(@Param('rent_month') rentMonth: string): Promise<ResponseAutoReportInterface> {
        const date = new Date(rentMonth)
        return await this.rentDayService.getRentReport(date)
    }
    
}