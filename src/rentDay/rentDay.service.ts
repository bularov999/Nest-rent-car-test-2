import { ResponseAutoReportInterface } from './dto/responseAutoReport.dto';
import { PerAutoReport } from './dto/perAutoReport.dto';
import { RentDayEntity } from './entities/rentDay.entity';
import { RentDayRepository } from './repository/rentDay.repository';
import { Injectable } from "@nestjs/common";

@Injectable()
export class RentDayService {
    constructor(private readonly rentDayRepository: RentDayRepository) { }
    async setRentDaysToDb(autoId, autoNumber, toDate, fromDate) {
        const oneDay: number = 60 * 60 * 24 * 1000
        const toDateMonth: number = toDate.getMonth() + 1
        const fromDateMonth: number = fromDate.getMonth() + 1
        if (toDateMonth == fromDateMonth) {
            const rentDays: number = toDate.getTime() - fromDate.getTime()
            const rentMonthDate: Date = toDate && fromDate
            const rentDaysres = await this.patchRentDaysInDb(autoId, autoNumber, rentMonthDate, Math.floor(rentDays / oneDay))
            console.log(rentDaysres)
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
        const newDate = `${date.getFullYear()} - ${date.getMonth() + 1}`
        console.log(autoId, autoNumber, date, rentDays)
        const resForFind = await this.rentDayRepository.findAutoByIdAndDate(autoNumber, newDate)
        if (resForFind && resForFind.rent_days_in_one_month) {
            const day = resForFind.rent_days_in_one_month + rentDays
            const resForUpdate = await this.rentDayRepository.update(day, autoNumber, newDate)
            return resForUpdate
        } else {
            const data: RentDayEntity = {
                autoId,
                autoNumber,
                rentDate: newDate,
                rentDaysInOneMonth: rentDays
            }
            const rentDayEntity = new RentDayEntity()
            Object.assign(rentDayEntity, data)
            const resForInsert = await this.rentDayRepository.insert(rentDayEntity)
            return resForInsert
        }
    }

    async getRentReport(rentMonth: Date): Promise<ResponseAutoReportInterface> {
        const queryDate = `${rentMonth.getFullYear()} - ${rentMonth.getMonth() + 1}`
        const row = await this.rentDayRepository.findByDate(queryDate)
        const perAutoReport: PerAutoReport[] = row.map((item) => {
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

    async createRentTable() {
        await this.rentDayRepository.create()
    }
}