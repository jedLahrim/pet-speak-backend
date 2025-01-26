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
import { x2 } from 'sha256';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { emailOrUsername } = createUserDto;

    if (!emailOrUsername) {
      throw new BadRequestException(
        'Either email or username must be provided',
      );
    }
    const value = `${process.env.ENCRYPTION_PHRASE}${emailOrUsername}`;
    const crypted = x2(value);
    const user = this.userRepository.create({
      emailOrUsername: emailOrUsername,
      hashedEmailOrUsername: crypted,
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
    const { emailOrUsername } = loginUserDto;

    // Validate that either email or username is provided
    if (!emailOrUsername) {
      throw new UnauthorizedException(
        'Either email or username must be provided',
      );
    }
    const value = `${process.env.ENCRYPTION_PHRASE}${emailOrUsername}`;
    const crypted = x2(value);
    // Find the user by email or username
    const user = await this.userRepository.findOne({
      where: { hashedEmailOrUsername: crypted },
      relations: { pets: true }
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
    const { emailOrUsername } = createUserDto;

    const value = `${process.env.ENCRYPTION_PHRASE}${emailOrUsername}`;
    const crypted = x2(value);

    const foundedEmailOrUsername = await this.userRepository.findOne({
      where: { hashedEmailOrUsername: crypted },
    });

    if (foundedEmailOrUsername) {
      throw new BadRequestException('This Email or username already exists');
    }
    const foundedUser = await this.userRepository.findOne({
      where: { id: user?.id },
    });
    if (!foundedUser) {
      throw new NotFoundException('ERR_NOT_FOUND_USER');
    }
    try {
      await this.userRepository.update(user?.id, {
        ...createUserDto,
      });
      return await this.userRepository.findOne({
        where: { id: user?.id },
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('This Email or username already exists');
      }
      throw error;
    }
  }

  async findOne(user: User) {
    const foundedUser = await this.userRepository.findOne({
      where: { id: user?.id },
      relations: { pets: true },
    });
    if (!foundedUser) {
      throw new NotFoundException('ERR_NOT_FOUND_USER');
    }
    return foundedUser;
  }
}
