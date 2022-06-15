import { AutoRentEntity } from './../entities/autoRent.entity';
import { PG_CONNECTION } from './../../constants/constants';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AutoRentRepository {
  constructor(@Inject(PG_CONNECTION) private readonly conn: any) { }
  async create(data: AutoRentEntity[]) {
    const query = `
    CREATE TABLE Auto (
      auto_id int ,
      auto_number varchar(255),
      PRIMARY KEY (auto_id, auto_number),
      name varchar(255),
      is_block BOOLEAN,
      from_date TIMESTAMP,
      to_date TIMESTAMP
      );
      INSERT INTO Auto(auto_id, name, auto_number, is_block, from_date, to_date) 
      VALUES  
      ('${data[0].autoId}', '${data[0].name}' , '${data[0].autoNumber}' , CAST('${data[0].isBlock}' as BOOLEAN), 
       TO_TIMESTAMP('${data[0].fromDate}', 'YYYY MM DD'),
       TO_TIMESTAMP('${data[0].toDate}', 'YYYY MM DD')
      ),
      ('${data[1].autoId}', '${data[1].name}' , '${data[1].autoNumber}' , CAST('${data[1].isBlock}' as BOOLEAN), 
      TO_TIMESTAMP('${data[1].fromDate}', 'YYYY MM DD'),
      TO_TIMESTAMP('${data[1].toDate}', 'YYYY MM DD')
      ),
      ('${data[2].autoId}', '${data[2].name}' , '${data[2].autoNumber}' , CAST('${data[2].isBlock}' as BOOLEAN), 
      TO_TIMESTAMP('${data[2].fromDate}', 'YYYY MM DD'),
      TO_TIMESTAMP('${data[2].toDate}', 'YYYY MM DD')
      ),
      ('${data[3].autoId}', '${data[3].name}' , '${data[3].autoNumber}' , CAST('${data[3].isBlock}' as BOOLEAN), 
      TO_TIMESTAMP('${data[3].fromDate}', 'YYYY MM DD'),
      TO_TIMESTAMP('${data[3].toDate}', 'YYYY MM DD')
      ),
      ('${data[4].autoId}', '${data[4].name}' , '${data[4].autoNumber}' , CAST('${data[4].isBlock}' as BOOLEAN), 
      TO_TIMESTAMP('${data[4].fromDate}', 'YYYY MM DD'),
      TO_TIMESTAMP('${data[4].toDate}', 'YYYY MM DD')
      );
      `;
    const res = await this.conn.query(query);
  }
  async findById(autoId) {
    const query = `SELECT * FROM Auto WHERE auto_id = ${autoId}`;
    const res = await this.conn.query(query);
    return res.rows[0];
  }
  async update(autoId, toDate, fromDate) {
    const query = `UPDATE Auto SET 
                    is_block = TRUE,
                    to_date = TO_TIMESTAMP('${toDate}', 'YYYY MM DD'),
                    from_date = TO_TIMESTAMP('${fromDate}', 'YYYY MM DD')
                    WHERE auto_id = ${autoId}`;
    const res = await this.conn.query(query)
    return res.rows[0]
  }
}
