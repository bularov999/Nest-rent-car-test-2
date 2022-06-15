import { PG_CONNECTION } from '../../constants/constants';
import { Inject, Injectable } from '@nestjs/common';
import { RentDayEntity } from '../entities/rentDay.entity';

@Injectable()
export class RentDayRepository {
  constructor(@Inject(PG_CONNECTION) private readonly conn: any) {}
  async create() {
    const query = `
    CREATE TABLE RentDays (
      auto_id int,
      auto_number varchar(255),
      rent_date TIMESTAMP,
      rent_days_in_one_month int,
      FOREIGN KEY (auto_id, auto_number) REFERENCES Auto (auto_id, auto_number)
  );`;
    const res = await this.conn.query(query);
  }

  async insert(data: RentDayEntity) {
    const query = `
        INSERT INTO RentDays (auto_id ,auto_number, rent_date, rent_days_in_one_month) 
                 VALUES( ${data.autoId},'${data.autoNumber}', TO_TIMESTAMP('${data.rentDate}', 'YYYY MM '), '${data.rentDaysInOneMonth}')
        `;
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
