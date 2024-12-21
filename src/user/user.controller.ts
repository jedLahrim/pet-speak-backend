import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './create-user.dto';
import { User } from './entity/user.entity';
import { LoginUserDto } from './login-user.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { GetUser } from './get-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.createUser(createUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<User> {
    return await this.userService.login(loginUserDto);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async update(
    @Body() createUserDto: CreateUserDto,
    @GetUser() user: User,
  ): Promise<User> {
    return await this.userService.update(createUserDto, user);
  }
}
