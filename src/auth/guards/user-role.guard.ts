import {
  BadGatewayException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from '../entities';
import { META_ROLES } from '../decorators/role-protected.decorator';
import { ValidRoles } from '../interfaces';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles = this.reflector.getAllAndOverride<ValidRoles[]>(
      META_ROLES,
      [context.getHandler(), context.getClass()],
    );

    if (!validRoles || validRoles.length === 0) return true;
    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user) {
      throw new BadGatewayException('user not found');
    }

    if (validRoles.includes(user.role)) {
      return true;
    }

    throw new ForbiddenException(
      `User ${user.fullName} needs one of these roles: [${validRoles.join(', ')}]`,
    );
  }
}
