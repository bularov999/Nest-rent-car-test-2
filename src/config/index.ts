import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv'

dotenv.config()
export class Config extends ConfigService {
    constructor(private readonly configService: ConfigService) {
        super()
    }
    static getConnectionOptions() {
        return {
            user:  process.env.POSTGRES_USER,
            host:  process.env.POSTGRES_HOST,
            database: process.env.POSTGRES_DB,
            password: process.env.POSTGRES_PASSWORD,
            port: +process.env.POSTGRES_LOCAL_PORT
        }
    }
}