import { Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'argon2';

import { PrismaService } from '@/prisma/prisma.service';

import { CreateUser } from './user.types';

@Injectable()
export class UserService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async findById(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: { id },
			include: { accounts: true }
		});

		if (!user) {
			throw new NotFoundException('User not found, please recheck data!');
		}

		return user;
	}

	public async findByEmail(email: string) {
		const user = await this.prismaService.user.findUnique({
			where: { email },
			include: { accounts: true }
		});

		return user;
	}

	public async create(createUser: CreateUser) {
		const password = createUser.password ? await hash(createUser.password) : '';

		const user = await this.prismaService.user.create({
			data: { ...createUser, password },
			include: { accounts: true }
		});

		return user;
	}
}
