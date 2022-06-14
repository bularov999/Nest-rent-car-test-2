import { ResponseAutoReportInterface } from './../dto/responseAutoReport.dto';
import { PerAutoReport } from './../dto/perAutoReport.dto';
import { RentDate } from './../dto/rentDate.dto';
import { PG_CONNECTION } from './../constants/constants';
import { HttpException, HttpStatus, Inject, Injectable, OnModuleInit, Render } from "@nestjs/common";
import { from } from 'rxjs';

@Injectable()
export class AutoRentService {
    constructor(@Inject(PG_CONNECTION) private readonly conn: any) { }

    async getAutoRent(autoId: string, rentDate: RentDate): Promise<String | HttpException> {
        const res = await this.conn.query(`SELECT * FROM Auto WHERE auto_id = ${autoId}`)
        const auto = res.rows[0]
        if (auto.is_block) {
            return new HttpException('you may not rent this car', HttpStatus.BAD_REQUEST)
        }
        const nextDate: Date = new Date(rentDate.toDate)
        const prevDate: Date = new Date(rentDate.fromDate)

        const weekendToDate: boolean = this.isWeekend(nextDate)
        const weekendFromDate: boolean = this.isWeekend(prevDate)

        if (weekendToDate || weekendFromDate) {
            return new HttpException('you may not rent on weekend days', HttpStatus.BAD_REQUEST)
        }
        const possibleRentByDayLimit = this.isPossibleRentByDayLimit(nextDate, prevDate)
        if (!possibleRentByDayLimit) {
            return new HttpException('you may not rent less 3 days', HttpStatus.BAD_REQUEST)
        }
        const rentLimitPossible = this.isNotRentLimitPossible(nextDate, prevDate)
        if (rentLimitPossible) {
            return new HttpException('you may not rent more than 30 days', HttpStatus.BAD_REQUEST)
        }
        const updatedAuto = await this.updateAutoValues(autoId, nextDate, prevDate)
        const rentedDaysToDb = await this.setRentDaysToDb(auto.auto_id, auto.auto_number, nextDate, prevDate)
        return this.rentPrice(nextDate, prevDate)
    }

    async getAutoReport(rentMonth: Date): Promise<ResponseAutoReportInterface>{
        const queryDate = `${rentMonth.getFullYear()} - ${rentMonth.getMonth() + 1}`
        const query = await this.conn.query(`
            SELECT auto_number, rent_days_in_one_month FROM RentDays WHERE rent_date = TO_TIMESTAMP('${queryDate}', 'YYYY MM');
        `)
        const row = query.rows
        const perAutoReport: PerAutoReport[]= row.map((item) => {
            return {
                autoNumber: item.auto_number,
                monthRentDays: item.rent_days_in_one_month,
                monthReport: `${Math.floor((item.rent_days_in_one_month / 30) * 100)} %`
            }
        })
        const allAutoReport: number = row.reduce((acc: number, item) => { return acc + item.rent_days_in_one_month }, 0)
        return {
            perAutoReport,
            allAutoReport
        }
    }

    async updateAutoValues(autoId: string, toDate: Date, fromDate: Date) {
        const toDateTimestamp = `${toDate.getFullYear()} - ${toDate.getMonth() + 1} - ${toDate.getDate()}`
        const fromDateTimestamp = `${fromDate.getFullYear()} - ${fromDate.getMonth() + 1} - ${fromDate.getDate()}}`
        const res = await this.conn.query(`
        UPDATE Auto SET 
        is_block = TRUE,
        to_date = TO_TIMESTAMP('${toDateTimestamp}', 'YYYY MM DD'),
        from_date = TO_TIMESTAMP('${fromDateTimestamp}', 'YYYY MM DD')
        WHERE auto_id = ${autoId}
        `)
        return res.rows[0]
    }

    async setRentDaysToDb(autoId: string, autoNumber: string, toDate: Date, fromDate: Date) {
        const oneDay: number = 60 * 60 * 24 * 1000
        const toDateMonth: number = toDate.getMonth() + 1
        const fromDateMonth: number = fromDate.getMonth() + 1
        if (toDateMonth == fromDateMonth) {
            const rentDays: number = toDate.getTime() - fromDate.getTime()
            const rentMonthDate: Date = toDate && fromDate
            const rentDaysres = await this.patchRentDaysInDb(autoId, autoNumber, rentMonthDate, Math.floor(rentDays / oneDay))
            return rentDaysres
        } else {
            const toDateDayRent: number = toDate.getDate()
            const fromDateDayRent: number = 30 - fromDate.getDate()
            const patchToDateRentDays = await this.patchRentDaysInDb(
                autoId,
                autoNumber,
                new Date(toDate.getFullYear(), toDate.getMonth() + 1),
                toDateDayRent
            )
            const patchFromDateRentDays = await this.patchRentDaysInDb(
                autoId,
                autoNumber,
                new Date(fromDate.getFullYear(), fromDate.getMonth() + 1),
                fromDateDayRent
            )
            return { patchToDateRentDays, patchFromDateRentDays }
        }
    }

    async patchRentDaysInDb(autoId: string, autoNumber: string, date: Date, rentDays: number) {
        const newDate = `${date.getFullYear()} - ${date.getMonth()}`

        const queryForFind = await this.conn.query(`
            SELECT * FROM RentDays
            WHERE auto_number='${autoNumber}'
            AND rent_date = TO_TIMESTAMP('${newDate}', 'YYYY MM ') 
        `)
        const resForFind = queryForFind.rows[0]
        if (resForFind && resForFind.rent_days_in_one_month) {
            const queryForUpdate = await this.conn.query(`
                UPDATE RentDays 
                SET rent_days_in_one_month = ${resForFind.rent_days_in_one_month + rentDays}
                WHERE auto_number='${autoNumber}'
                AND rent_date=TO_TIMESTAMP('${newDate}', 'YYYY MM ')
            `)
            const resForUpdate = queryForUpdate.rows
            return resForUpdate
        } else {
            const queryForInsert = await this.conn.query(
                `INSERT INTO RentDays (auto_id ,auto_number, rent_date, rent_days_in_one_month) 
                 VALUES( ${autoId},'${autoNumber}', TO_TIMESTAMP('${newDate}', 'YYYY MM '), '${rentDays}')
            `)
            const resForInsert = queryForInsert.rows
            return resForInsert
        }
    }

    isNotRentLimitPossible(toDate: Date, fromDate: Date): boolean {
        const oneDay = 60 * 60 * 24 * 1000
        const rentDayTime = toDate.getTime() - fromDate.getTime()
        const rentDays = Math.floor(rentDayTime / oneDay)
        return rentDays > 30
    }

    isPossibleRentByDayLimit(toDate: Date, fromDate: Date): boolean {
        const limitDay: number = (60 * 60 * 24 * 1000) * 3
        const endDay: number = toDate.getTime()
        const startDay: number = fromDate.getTime()
        return (endDay - startDay) >= limitDay

    }

    isWeekend(date: Date): boolean {
        return date.getDay() === 6 || date.getDay() === 0
    }

    rentPrice(toDate: Date, fromDate: Date): String {
        const perDay: number = 60 * 60 * 24 * 1000
        const baseRentPrice: number = 1000
        const disCountRentPrice = (discount: number): number => baseRentPrice / 100 * discount
        const rentedDayCount: number = toDate.getTime() - fromDate.getTime()
        if (rentedDayCount <= perDay * 4) {
            return `your rent sum is ${baseRentPrice}`
        }
        if (rentedDayCount >= perDay * 5 && rentedDayCount <= perDay * 9) {
            return `your rent sum is ${baseRentPrice - disCountRentPrice(5)}`
        }
        if (rentedDayCount >= perDay * 10 && rentedDayCount <= perDay * 17) {
            return `your rent sum is ${baseRentPrice - disCountRentPrice(10)}`
        }
        if (rentedDayCount >= perDay * 18 && rentedDayCount <= perDay * 30) {
            return `your rent sum is ${baseRentPrice - disCountRentPrice(15)}`
        }
    }
}