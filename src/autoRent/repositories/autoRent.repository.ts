import { PG_CONNECTION } from './../../constants/constants';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AutoRentRepository {
  constructor(@Inject(PG_CONNECTION) private readonly conn: any) { }
  async createTable() {
    const query = `
    CREATE TABLE Auto (
      auto_id int PRIMARY KEY,
      auto_number varchar(255),
      name varchar(255)
      )`
      const res = await this.conn.query(query)
      return res.rows[0]
    }

    async insertDataToTable() {
      const query =  `INSERT INTO Auto(auto_id, auto_number,name)  VALUES  
      (1, 'audi', '1111a'),
      (2, 'mercedes', '2222b'),
      (3, 'honda', '3333c'),
      (4, 'lexus', '4444e'),
      (5, 'toyota', '5555r')
      `;
      const res = await this.conn.query(query)
      return res.rows[0]
    }

  async findById(autoId: number) {
    const query = `SELECT * FROM Auto WHERE auto_id = ${autoId}`;
    const res = await this.conn.query(query);
    return res.rows[0];
  }

  async findAllAutos() {
    const query = `Select * FROM Auto`
    const res = await this.conn.query(query)
    return res.rows
  }
}
