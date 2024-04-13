import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcryptjs';
import { GetUserDto } from './dto/get-user.dto';
import { Types } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}
  async create(createUserDto: CreateUserDto) {
    return this.usersRepository.create({
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, 10),
    });
  }
  async verifyUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({
      email,
    });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }
    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }
    return user;
  }

  async getUser(getUserDto: GetUserDto) {
    const userId = new Types.ObjectId(getUserDto._id);
    return this.usersRepository.findOne({
      _id: userId,
    });
  }
}
