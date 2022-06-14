import { Config } from './../config/index';
import { Module } from "@nestjs/common";
import { Pool } from "pg";
import { PG_CONNECTION } from "../constants/constants";

const dbProvider = {
    provide: PG_CONNECTION,
    useValue: new Pool(Config.getConnectionOptions()),
}

@Module({
    providers: [dbProvider],
    exports: [dbProvider],
})
export class DbModule { }