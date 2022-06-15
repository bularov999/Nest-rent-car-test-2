import { ApiProperty } from '@nestjs/swagger';
import { PerAutoReport } from './perAutoReport.dto';
export class ResponseAutoReportInterface {
    @ApiProperty()
    perAutoReport: PerAutoReport[];
    allAutoReport: number;
}