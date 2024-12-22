import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { CreateUserDto } from './create-user.dto';
import { LoginUserDto } from './login-user.dto';
import * as jwt from 'jsonwebtoken';
import * as process from 'node:process';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, username } = createUserDto;

    if (!email && !username) {
      throw new BadRequestException(
        'Either email or username must be provided',
      );
    }

    const user = this.userRepository.create({
      email,
      username,
    });

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('Email or username already exists');
      }
      throw error;
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<User> {
    const { email, username } = loginUserDto;

    // Validate that either email or username is provided
    if (!email && !username) {
      throw new UnauthorizedException(
        'Either email or username must be provided',
      );
    }

    // Find the user by email or username
    const user = await this.userRepository.findOne({
      where: email ? { email } : { username },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '15d',
    });

    user.access = accessToken;
    return user;
  }

  async update(createUserDto: CreateUserDto, user: User) {
    const { email, username } = createUserDto;
    const emailUser = await this.userRepository.findOne({
      where: { email: email },
    });
    const usernameUser = await this.userRepository.findOne({
      where: { username: username },
    });
    if (emailUser && usernameUser) {
      throw new BadRequestException('This Email or username already exists');
    }
    const foundedUser = await this.userRepository.findOne({
      where: { id: user?.id },
    });
    if (!foundedUser) {
      throw new NotFoundException('ERR_NOT_FOUND_USER');
    }
    await this.userRepository.update(user?.id, {
      ...createUserDto,
    });
    return await this.userRepository.findOne({
      where: { id: user?.id },
    });
  }
}
