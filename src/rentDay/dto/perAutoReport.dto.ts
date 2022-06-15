import { ApiProperty } from "@nestjs/swagger"

export class PerAutoReport {
    @ApiProperty()
    autoNumber: string;
    monthRentDays: number;
    monthReport: string;
}