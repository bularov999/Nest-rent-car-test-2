import { ResponseReportRentDaysDto } from './dto/responseReportRentDays.dto';
import { CountedReportRentDaysDto } from './dto/countedReportRentDaysDto.dto';
import { ReportDto } from './dto/reportDto.dto';
import { CreateRentDto } from './dto/createRentDto.dto';
import { ResponseMessage } from './dto/responseMessageDto.dto';
import { THREE_DAYS_IN_MILISECOND, ONE_DAY_IN_MILISECOND, DAYS_IN_NUMBER, DISCOUNT_PRICE, MAXIMUM_RENT_DAY_LIMIT, BASEPRICE } from './../constants/constants';
import { DateGettimeFormatDto } from './dto/dateGettimeFormatDto.dto';
import { DateInYYYYMMFormatDto } from './dto/dateInYYYYMMFormatDto.dto';
import { RequestDateDto } from './dto/requestDateDto.dto';
import { AutoRentService } from './../autoRent/autoRent.service';
import { RentDayEntity } from './entities/rentDay.entity';
import { RentDayRepository } from './repository/rentDay.repository';
import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class RentDayService {
    constructor(private readonly rentDayRepository: RentDayRepository, private readonly autoRentService: AutoRentService) { }



    async getRentReportByMonth(date: string): Promise<ResponseReportRentDaysDto | BadRequestException> {
        const rentMonth: number = this._dateGetMonth(date)
        const rentYear: number = this._dateGetYear(date)
        const queryRentResult = await this.rentDayRepository.findRentByMonth(rentMonth, rentYear)
        if (!queryRentResult) throw new BadRequestException('no rent on this month')
        const allReportOnMonth: CountedReportRentDaysDto[] = queryRentResult.map((item: ReportDto) => {
            const toDateMonth: number = this._dateGetMonth(item.to_date)
            const fromDateMonth: number = this._dateGetMonth(item.from_date)
            if (toDateMonth == fromDateMonth) {
                const daysDifference: number = (new Date(item.to_date).getTime() - new Date(item.from_date).getTime()) / ONE_DAY_IN_MILISECOND
                return {
                    autoId: item.auto_id,
                    autoNumber: item.auto_number,
                    name: item.name,
                    rentDays: daysDifference
                }
            } else {
                const rentLastDateInMilisecond = new Date(rentYear, rentMonth, 0).getTime()
                const fromDateInMilisecond = this._dateGetTimeFormatter(item.from_date)
                const daysDifference = Math.floor((rentLastDateInMilisecond - fromDateInMilisecond) / ONE_DAY_IN_MILISECOND)
                return {
                    autoId: item.auto_id,
                    autoNumber: item.auto_number,
                    name: item.name,
                    rentDays: daysDifference
                }
            }
        })
        const groupedReportRentDaysOnMonth = allReportOnMonth.reduce((acc, obj) => {
            return acc + obj.rentDays
        }, 0)
        return {
            allRents: allReportOnMonth,
            allRentDays: groupedReportRentDaysOnMonth
        }
    }




    async getInfoPossibleToRent(autoId: number, date: RequestDateDto): Promise<ResponseMessage | BadRequestException> {
        const possibleTorent = await this.getIsPossibleToRent(autoId, date)
        if (!possibleTorent) {
            throw new BadRequestException('you can not on this date')
        }
        return {
            message: 'you can rant on this date'
        }
    }

    async rentAutoCalculation(autoId: number, date: RequestDateDto): Promise<ResponseMessage | BadRequestException> {
        const isWeekendRentDay = this.getIsWeekend(new Date(date.fromDate), new Date(date.toDate))
        if (isWeekendRentDay) return new BadRequestException('you can not rent on weekend days')

        const isMaximumDayLimit = this.getMaximumRentDayLimit(date)
        if (isMaximumDayLimit) throw new BadRequestException('you can not rent more then 30 days')

        const countedTarif = this.countRentDayTarif(date)
        return {
            message: countedTarif
        }
    }

    async rentAutoSession(createRentDto: CreateRentDto): Promise<ResponseMessage | BadRequestException> {
        const date: RequestDateDto = {
            fromDate: createRentDto.fromDate,
            toDate: createRentDto.toDate
        }
        const isWeekendRentDay = this.getIsWeekend(new Date(date.fromDate), new Date(date.toDate))
        if (isWeekendRentDay) return new BadRequestException('you can not rent on weekend days')

        const isMaximumDayLimit = this.getMaximumRentDayLimit(date)
        if (isMaximumDayLimit) throw new BadRequestException('you can not rent more then 30 days')

        const isPossibletoRent = await this.getIsPossibleToRent(createRentDto.autoId, date)
        if (!isPossibletoRent) throw new BadRequestException('you can not on this date')

        const message: ResponseMessage = await this.createRentDaySession(createRentDto)
        return message
    }


    async getIsPossibleToRent(autoId: number, date: RequestDateDto): Promise<boolean> {
        const newDate: DateInYYYYMMFormatDto = {
            fromDate: this._dateYYYYMMDDFormatter(date.fromDate),
            toDate: this._dateYYYYMMDDFormatter(date.toDate)
        }
        const auto = await this.autoRentService.findById(autoId)
        if (!auto) {
            throw new BadRequestException('There is no auto with that ID ')
        }
        const rentedMonths = await this.rentDayRepository.findRentMonthByAutoId(autoId, newDate)
        if (rentedMonths.length) {
            const reqGettimeFormatDate: DateGettimeFormatDto = {
                fromDate: this._dateGetTimeFormatter(date.fromDate),
                toDate: this._dateGetTimeFormatter(date.toDate)
            }

            const filteredRentDatesArr = rentedMonths.filter((item) => {
                const resGettimeFormatDate: DateGettimeFormatDto = {
                    fromDate: this._dateGetTimeFormatter(item.from_date),
                    toDate: this._dateGetTimeFormatter(item.to_date)
                }
                if (
                    !(((reqGettimeFormatDate.fromDate > resGettimeFormatDate.fromDate &&
                        reqGettimeFormatDate.toDate > resGettimeFormatDate.fromDate) &&
                        (reqGettimeFormatDate.fromDate > resGettimeFormatDate.toDate + THREE_DAYS_IN_MILISECOND &&
                            reqGettimeFormatDate.toDate > resGettimeFormatDate.toDate + THREE_DAYS_IN_MILISECOND))
                        ||
                        ((reqGettimeFormatDate.fromDate < resGettimeFormatDate.fromDate &&
                            reqGettimeFormatDate.toDate < resGettimeFormatDate.fromDate) &&
                            (reqGettimeFormatDate.fromDate < resGettimeFormatDate.toDate + THREE_DAYS_IN_MILISECOND &&
                                reqGettimeFormatDate.toDate < resGettimeFormatDate.toDate + THREE_DAYS_IN_MILISECOND)))
                ) {
                    return item
                }
            })
            if (filteredRentDatesArr.length) {
                return false
            } else {
                return true
            }
        } else {
            return true
        }
    }

    countRentDayTarif(date: RequestDateDto): string {
        const rentDateSubtraction: number = this._dateGetTimeDeltaFormatter(date)
        const reqRentDaysCount: number = rentDateSubtraction / ONE_DAY_IN_MILISECOND
        const discountPrice = (discount: number): number => BASEPRICE / 100 * discount
        if (reqRentDaysCount >= DAYS_IN_NUMBER.oneDay && reqRentDaysCount <= DAYS_IN_NUMBER.fourDays) {
            return `Your rent price is ${BASEPRICE}`
        }
        if (reqRentDaysCount >= DAYS_IN_NUMBER.fiveDays && reqRentDaysCount <= DAYS_IN_NUMBER.nineDays) {
            return `Your rent price is ${BASEPRICE - discountPrice(DISCOUNT_PRICE.fivePercent)}`
        }
        if (reqRentDaysCount >= DAYS_IN_NUMBER.tenDays && reqRentDaysCount <= DAYS_IN_NUMBER.seventeenDays) {
            return `Your rent price is ${BASEPRICE - discountPrice(DISCOUNT_PRICE.tenPercent)}`
        }
        if (reqRentDaysCount >= DAYS_IN_NUMBER.eightteenDays && reqRentDaysCount <= DAYS_IN_NUMBER.thirtyDays) {
            return `Your rent price is ${BASEPRICE - discountPrice(DISCOUNT_PRICE.fifteenPercent)}`
        }
    }
    _dateLastDayOfMonth(year: number, month: number): number {
        return (new Date(year, month, 0)).getDate()
    }
    _dateGetMonth(str: string | Date): number {
        return new Date(str).getMonth() + 1
    }
    _dateGetYear(str: string): number {
        return new Date(str).getFullYear()
    }
    _dateYYYYMMDDFormatter(str: string): string {
        return new Date(str).toISOString().split('T')[0]
    }
    _dateGetTimeDeltaFormatter(date: RequestDateDto): number {
        return new Date(date.toDate).getTime() - new Date(date.fromDate).getTime()
    }
    _dateGetTimeFormatter(date: string | Date): number {
        return new Date(date).getTime()
    }

    getIsWeekend(fromDate: Date, toDate: Date): boolean {
        const fromDateDayOfWeek: number = fromDate.getDay()
        const toDateDayOfWeek: number = toDate.getDay()
        const isWeekendFromDateDay: boolean = (fromDateDayOfWeek === 6) || (fromDateDayOfWeek === 0)
        const isWeekendToDateDay: boolean = (fromDateDayOfWeek === 6) || (fromDateDayOfWeek === 0)
        return (isWeekendFromDateDay || isWeekendToDateDay)
    }

    getMaximumRentDayLimit(date: RequestDateDto): boolean {
        const rentedDaysInMilisecond = this._dateGetTimeDeltaFormatter(date)
        const rentedDaysCount = rentedDaysInMilisecond / ONE_DAY_IN_MILISECOND
        return rentedDaysCount > MAXIMUM_RENT_DAY_LIMIT
    }

    async createRentTable() {
        await this.rentDayRepository.createRentTable()
    }

    async createRentDaySession(createRentDto: CreateRentDto): Promise<ResponseMessage | BadRequestException> {
        const auto = await this.autoRentService.findById(createRentDto.autoId)
        if (auto) {
            const data: RentDayEntity = {
                autoId: auto.auto_id,
                fromDate: this._dateYYYYMMDDFormatter(createRentDto.fromDate),
                toDate: this._dateYYYYMMDDFormatter(createRentDto.toDate)
            }
            const entity = new RentDayEntity(data)
            await this.rentDayRepository.insert(entity)

            return {
                message: 'your auto is rented'
            }
        } else {
            throw new BadRequestException('auto is not defined')
        }
    }
}