import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(
    private readonly dataSource:DataSource,
  ) {}

  public get repo() {
    return this.dataSource.getRepository(User);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  async create(data: CreateUserDto) {
    const user = this.repo.create(data);
    return await this.repo.save(user);
  }

  async update(id: number, data: UpdateUserDto) : Promise<User> {
    const user = await this.repo.update(id,data);
    if (!user) throw new RpcException({
      error: 'User not found',
      status: 400
    });
    return (await this.findOne(id))!;
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException();
    return await this.repo.remove(user);
  }
}
