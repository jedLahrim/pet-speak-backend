import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return await (super.canActivate(context) as Promise<boolean>);
    } catch (e) {
      throw new UnauthorizedException('ERR_UNAUTHORIZED');
    }
  }
}
