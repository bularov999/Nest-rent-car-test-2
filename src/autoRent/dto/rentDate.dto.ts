import { ApiProperty } from "@nestjs/swagger";

export class RentDate {
    @ApiProperty()
    fromDate: Date;
    toDate: Date;
}

