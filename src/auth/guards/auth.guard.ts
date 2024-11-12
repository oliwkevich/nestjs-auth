import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException
} from '@nestjs/common';

import { UserService } from '@/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private readonly userService: UserService) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		console.log('request', request)

		if (typeof request.session.userId === 'undefined') {
			throw new UnauthorizedException('UserId not found');
		}

		const user = await this.userService.findById(request.session.userId);
		request.user = user;
		return true;
	}
}
