import { ResponseReportRentDaysDto } from './dto/responseReportRentDays.dto';
import { ResponseMessage } from './dto/responseMessageDto.dto';
import { CreateRentDto } from './dto/createRentDto.dto';
import { RequestDateDto } from './dto/requestDateDto.dto';
import { RentDayService } from './rentDay.service';
import { BadRequestException, Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiParam } from '@nestjs/swagger';

@Controller('rent')
export class RentDayController {
    constructor(private readonly rentDayService: RentDayService) { }

    @ApiParam({ name: 'auto_id' })
    @Post(':auto_id/info')
    async getInfoPossibleToRent(@Param('auto_id') autoId: number, @Body() date: RequestDateDto): 
    Promise<ResponseMessage | BadRequestException> {
        return await this.rentDayService.getInfoPossibleToRent(autoId, date)
    }

    @ApiParam({ name: 'auto_id' })
    @Post(':auto_id/calc')
    async rentAutoCalculation(@Param('auto_id') autoId: number, @Body() date: RequestDateDto): 
    Promise<ResponseMessage | BadRequestException> {
        return await this.rentDayService.rentAutoCalculation(autoId, date)
    }

    @Post('/create_session')
    async rentAutoSession(@Body() createRentDto: CreateRentDto): Promise<ResponseMessage | BadRequestException>  {
        return await this.rentDayService.rentAutoSession(createRentDto)
    }

    @ApiParam({ name: 'rent_month' })
    @Get('/:rent_month/report')
    async findRentByMonth(@Param('rent_month') date: string): Promise<ResponseReportRentDaysDto | BadRequestException>  {
        return await this.rentDayService.getRentReportByMonth(date)
    }
}

