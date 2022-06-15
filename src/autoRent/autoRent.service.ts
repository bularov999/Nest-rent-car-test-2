import { AutoRentEntity } from './entities/autoRent.entity';
import { ResponseAutoRentAccess } from './dto/responseAutoAccess.dto';
import { RentDayService } from './../rentDay/rentDay.service';
import { AutoRentRepository } from './repositories/autoRent.repository';
import { RentDate } from './dto/rentDate.dto';
import { PG_CONNECTION } from '../constants/constants';
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
  Render,
} from '@nestjs/common';

@Injectable()
export class AutoRentService {
  constructor(
    @Inject(forwardRef(() => RentDayService))
    private readonly rentDayService: RentDayService,
    private readonly autoRentRepository: AutoRentRepository,
  ) { }
  async createAutoTable(data: AutoRentEntity[]) {
    await this.autoRentRepository.create(data)
  }
  async rentAutoInfo(
    autoId: string,
    rentDate: RentDate,
  ): Promise<String | HttpException> {
    const auto = await this.autoRentRepository.findById(autoId);
    if (auto.is_block) {
      return new HttpException(
        'you may not rent this car',
        HttpStatus.BAD_REQUEST,
      );
    }
    const nextDate: Date = new Date(rentDate.toDate);
    const prevDate: Date = new Date(rentDate.fromDate);

    const weekendToDate: boolean = this.isWeekend(nextDate);
    const weekendFromDate: boolean = this.isWeekend(prevDate);

    if (weekendToDate || weekendFromDate) {
      return new HttpException(
        'you may not rent on weekend days',
        HttpStatus.BAD_REQUEST,
      );
    }
    const possibleRentByDayLimit = this.isPossibleRentByDayLimit(
      nextDate,
      prevDate,
    );
    if (!possibleRentByDayLimit) {
      return new HttpException(
        'you may not rent less 3 days',
        HttpStatus.BAD_REQUEST,
      );
    }
    const rentLimitPossible = this.isNotRentLimitPossible(nextDate, prevDate);
    if (rentLimitPossible) {
      return new HttpException(
        'you may not rent more than 30 days',
        HttpStatus.BAD_REQUEST,
      );
    }

    const message = this.rentPrice(nextDate, prevDate);
    return message;
  }

  async rentAuto(autoId, toDate, fromDate) {
    const nextDate = new Date(toDate)
    const prevDate = new Date(fromDate)
    const updatedAuto = await this.updateAutoValues(autoId, nextDate, prevDate);
    const auto = await this.autoRentRepository.findById(autoId)
    const rentedDaysToDb = await this.rentDayService.setRentDaysToDb(
      auto.auto_id,
      auto.auto_number,
      nextDate,
      prevDate,
    );
    return `auto is rented from ${fromDate} to ${toDate}`
  }

  async getAutoAccess(autoId): Promise<ResponseAutoRentAccess> {
    const res = await this.autoRentRepository.findById(autoId);
    if (res) {
      if (res.is_block) {
        return {
          message: 'Auto is blocked',
        };
      } else {
        return {
          message: 'Auto is free',
        };
      }
    } else {
      return new HttpException('auto is not found', HttpStatus.BAD_REQUEST);
    }
  }

  async updateAutoValues(autoId: string, toDate: Date, fromDate: Date) {
    const toDateTimestamp = `${toDate.getFullYear()} - ${toDate.getMonth() + 1} - ${toDate.getDate()}`;
    const fromDateTimestamp = `${fromDate.getFullYear()} - ${fromDate.getMonth() + 1} - ${fromDate.getDate()}}`;
    const res = await this.autoRentRepository.update(
      autoId,
      toDateTimestamp,
      fromDateTimestamp,
    );
    return res;
  }

  isNotRentLimitPossible(toDate: Date, fromDate: Date): boolean {
    const oneDay = 60 * 60 * 24 * 1000;
    const rentDayTime = toDate.getTime() - fromDate.getTime();
    const rentDays = Math.floor(rentDayTime / oneDay);
    return rentDays > 30;
  }

  isPossibleRentByDayLimit(toDate: Date, fromDate: Date): boolean {
    const limitDay: number = 60 * 60 * 24 * 1000 * 3;
    const endDay: number = toDate.getTime();
    const startDay: number = fromDate.getTime();
    return endDay - startDay >= limitDay;
  }

  isWeekend(date: Date): boolean {
    return date.getDay() === 6 || date.getDay() === 0;
  }

  rentPrice(toDate: Date, fromDate: Date): String {
    const perDay: number = 60 * 60 * 24 * 1000;
    const baseRentPrice: number = 1000;
    const disCountRentPrice = (discount: number): number =>
      (baseRentPrice / 100) * discount;
    const rentedDayCount: number = toDate.getTime() - fromDate.getTime();
    if (rentedDayCount <= perDay * 4) {
      return `your rent sum is ${baseRentPrice}`;
    }
    if (rentedDayCount >= perDay * 5 && rentedDayCount <= perDay * 9) {
      return `your rent sum is ${baseRentPrice - disCountRentPrice(5)}`;
    }
    if (rentedDayCount >= perDay * 10 && rentedDayCount <= perDay * 17) {
      return `your rent sum is ${baseRentPrice - disCountRentPrice(10)}`;
    }
    if (rentedDayCount >= perDay * 18 && rentedDayCount <= perDay * 30) {
      return `your rent sum is ${baseRentPrice - disCountRentPrice(15)}`;
    }
  }
}
