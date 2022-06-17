export class RentDayEntity {
    constructor({ autoId, fromDate, toDate }) {
      this.autoId = autoId;
      this.fromDate = fromDate;
      this.toDate = toDate;
    }
    autoId: number;
    fromDate: string;
    toDate: string;
  }
