import { Injectable } from '@nestjs/common';
import { User } from '../entity/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async getByEmail(email: string) {
    return await this.findOne({
      where: {
        email: email,
      },
    });
  }

  async getById(id: number) {
    return await this.findOneBy({ id });
  }

  async getResetPasswordToken(token: string) {
    return await this.findOne({
      where: {
        reset_password_token: token,
      },
    });
  }
}
