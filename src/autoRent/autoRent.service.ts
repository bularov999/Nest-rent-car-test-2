import { AutoRentEntity } from './entities/autoRent.entity';
import { RentDayService } from './../rentDay/rentDay.service';
import { AutoRentRepository } from './repositories/autoRent.repository';
import { PG_CONNECTION } from '../constants/constants';
import {
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AutoRentService {
  constructor(private readonly autoRentRepository: AutoRentRepository) { }

  async createAutoTable() {
    await this.autoRentRepository.createTable()
    await this.autoRentRepository.insertDataToTable()
  }

  async insertDataToTable() {
    await this.autoRentRepository.insertDataToTable()
  }

  async findById(autoId: number) {
    return await this.autoRentRepository.findById(autoId)
  }

  async findAllAutos() {
    return await this.autoRentRepository.findAllAutos()
  }
}
