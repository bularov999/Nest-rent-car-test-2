import { ReportDto } from './../dto/reportDto.dto';
import { RentMonthByAutoIdResponse } from '../dto/rentMonthByAutoIdResponse.dto';
import { DateInYYYYMMFormatDto } from './../dto/dateInYYYYMMFormatDto.dto';
import { PG_CONNECTION } from '../../constants/constants';
import { Inject, Injectable } from '@nestjs/common';
import { RentDayEntity } from '../entities/rentDay.entity';

@Injectable()
export class RentDayRepository {
  constructor(@Inject(PG_CONNECTION) private readonly conn: any) {}
  async createRentTable() {
    const query = `
    CREATE TABLE RentDays (
      id SERIAL PRIMARY KEY,
      auto_id int,
      from_date TIMESTAMP,
      to_date TIMESTAMP,
      FOREIGN KEY (auto_id) REFERENCES Auto (auto_id)
  );`;
    const res = await this.conn.query(query);
    return res.rows[0]
  }

  async findRentMonthByAutoId(autoId: number, date: DateInYYYYMMFormatDto): Promise<RentMonthByAutoIdResponse[]> {
    const query = `
    SELECT from_date::varchar, to_date::varchar FROM rentdays WHERE auto_id='${autoId}'
    `
    const res = await this.conn.query(query)
    return res.rows
  }
  
  async findRentByMonth(month: number, year: number): Promise<ReportDto[]> {
    const query = `
    SELECT * FROM rentDays INNER JOIN auto ON auto.auto_id = rentdays.auto_id WHERE EXTRACT(MONTH FROM rentdays.from_date) = ${month} 
    AND EXTRACT(YEAR FROM rentdays.from_date) = ${year}
    `
    const res = await this.conn.query(query)
    return res.rows
  }

  async insert(entity: RentDayEntity) {
    const query = `
      INSERT INTO RentDays(auto_id, from_date, to_date) 
      VALUES ('${entity.autoId}', TO_TIMESTAMP('${entity.fromDate}', 'YYYY MM DD'), 
      TO_TIMESTAMP('${entity.toDate}', 'YYYY MM DD')
      )
    `
    const res = await this.conn.query(query)
    return res.rows[0]
  }













  

  async update(day, autoNumber, date) {
    const query = `
        UPDATE RentDays 
        SET rent_days_in_one_month = ${day}
        WHERE auto_number='${autoNumber}'
        AND rent_date=TO_TIMESTAMP('${date}', 'YYYY MM ')
        `;
        const res = await this.conn.query(query)
        return res.rows[0]
  }

  async findAutoByIdAndDate(autoNumber, newDate) {
    const query = `
        SELECT * FROM RentDays
        WHERE auto_number='${autoNumber}'
        AND rent_date = TO_TIMESTAMP('${newDate}', 'YYYY MM ') 
    `;
    const res = await this.conn.query(query);
    return res.rows[0]
  }

  async findByDate(date) {
    const query = `SELECT auto_number, rent_days_in_one_month FROM RentDays WHERE rent_date = TO_TIMESTAMP('${date}', 'YYYY MM')`;
    const res = await this.conn.query(query);
    return res.rows;
  }
}
