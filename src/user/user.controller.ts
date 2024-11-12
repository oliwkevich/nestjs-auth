import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { UserRole } from '@prisma/__generated__';

import { Authorization } from '@/auth/decoradtors/auth.decorator';
import { Authorized } from '@/auth/decoradtors/authorized.decorator';

import { UserService } from './user.service';

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Authorization()
	@HttpCode(HttpStatus.OK)
	@Get('profile')
	public async findProfile(@Authorized('id') userId: string) {
		return this.userService.findById(userId);
	}

	@Authorization(UserRole.ADMIN)
	@HttpCode(HttpStatus.OK)
	@Get('by-id/:id')
	public async findProfileById(@Param('id') userId: string) {
		return this.userService.findById(userId);
	}
}
