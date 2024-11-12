import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/__generated__';

import { ROKES_KEY } from '../decoradtors/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const roles = this.reflector.getAllAndOverride<UserRole[]>(ROKES_KEY, [
			context.getHandler(),
			context.getClass()
		]);

		const request = context.switchToHttp().getRequest();

		if (!roles) return true;

		if (!roles.includes(request.user.role)) {
			throw new ForbiddenException();
		}

		return true;
	}
}
