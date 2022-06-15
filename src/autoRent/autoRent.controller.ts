import { ResponseAutoReportInterface } from '../rentDay/dto/responseAutoReport.dto';
import { RentDate } from './dto/rentDate.dto';
import { AutoRentService } from './autoRent.service';
import {
  Body,
  Controller,
  Get,
  HttpException,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOAuth2, ApiParam } from '@nestjs/swagger';
import { ResponseAutoRentAccess } from './dto/responseAutoAccess.dto';

@Controller()
export class AutoRentController {
  constructor(private readonly autoRentService: AutoRentService) { }

  @ApiParam({ name: 'auto_id' })
  @Post('car/:auto_id/info')
  async rentAutoInfo(@Param('auto_id') carId, @Body() body: RentDate,
  ): Promise<String | HttpException> {
    return await this.autoRentService.rentAutoInfo(carId, body);
  }

  @ApiParam({name: 'auto_id'})
  @Post('car/:auto_id/rent')
  async rentAuto(@Param('auto_id') autoId, @Body() body) {
    return await this.autoRentService.rentAuto(autoId, body.toDate, body.fromDate);
  }

  @ApiParam({name: 'auto_id'})
  @Get('car/:auto_id/block')
  async getAutoAccess(@Param('auto_id') autoId): Promise<ResponseAutoRentAccess> {
    return this.autoRentService.getAutoAccess(autoId);
  }
}
