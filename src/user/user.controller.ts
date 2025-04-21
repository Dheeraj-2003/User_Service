import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Controller()
export class UserController {
  constructor(private readonly service: UserService) {}

  @MessagePattern({ cmd: 'get-all-users' })
  async findAll() {
    try {
      console.log('Connection established')
      return await this.service.findAll();
    } catch (error) {
      console.log(error)
      throw(error)
    }
  }

  @MessagePattern({cmd: 'get-user'})
  async findOne(@Payload() query: any) {
    return await this.service.findOne(query);
  }

  @MessagePattern({ cmd: 'create-user' })
  async create(@Payload() payload:any) {
    try {
      const createUserDto = plainToInstance(CreateUserDto, payload);
      const errors = await validate(createUserDto);
      if (errors.length > 0) {
        const errorMessages = errors
          .map(err => Object.values(err.constraints || {}))
          .flat()
          .join(', ');
        throw new RpcException({
          status: 400,
          message: errorMessages,
        });
      }
      console.log('Created a User')
      return await this.service.create(payload);
    } catch (error) {
      console.log(error)
      throw new RpcException(
        {
          status: error.error.status ?? 500,
          message: error.error.message ?? error.message,
        }
      )
    }
  }

}
