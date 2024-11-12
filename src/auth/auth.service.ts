import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthMethod, User } from '@prisma/__generated__';
import { verify } from 'argon2';
import { Request, Response } from 'express';

import { PrismaService } from '@/prisma/prisma.service';
import { UserService } from '@/user/user.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ProviderService } from './provider/provider.service';

@Injectable()
export class AuthService {
	public constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService,
		private readonly prismaService: PrismaService,
		private readonly providerService: ProviderService
	) {}

	public async register(req: Request, dto: RegisterDto) {
		const isExistUser = await this.userService.findByEmail(dto.email);

		if (isExistUser) {
			throw new ConflictException(
				'Email already used, try another one or login via this email!'
			);
		}

		const newUser = await this.userService.create({
			picture: '',
			email: dto.email,
			isVerified: false,
			displayName: dto.name,
			password: dto.password,
			method: AuthMethod.CREDENTIALS
		});

		return this.saveSession(req, newUser);
	}

	public async login(req: Request, dto: LoginDto) {
		const user = await this.userService.findByEmail(dto.email);

		if (!user || !user.password) {
			throw new NotFoundException('Incorrect password or email!');
		}

		const isValidPassword = await verify(user.password, dto.password);

		if (!isValidPassword) {
			throw new UnauthorizedException('Incorrect password or email!');
		}

		return this.saveSession(req, user);
	}

	public async logout(req: Request, res: Response) {
		return new Promise((resolve, reject) => {
			req.session.destroy(error => {
				if (error) {
					return reject(
						new InternalServerErrorException(
							'Cant close session, server error or session already closed!'
						)
					);
				}

				res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'));

				resolve({ success: true });
			});
		});
	}

	private async saveSession(req: Request, user: User) {
		return new Promise((resolve, reject) => {
			req.session.userId = user.id;

			console.log('user.id', user.id);

			req.session.save(error => {
				if (error)
					return reject(
						new InternalServerErrorException(
							'Cant save session, recheck session parameters please!'
						)
					);
			});

			console.log('req.session', req.session);

			resolve({ user });
		});
	}

	public async extractProfileFromCode(
		req: Request,
		provider: string,
		code: string
	) {
		const providerInstance = this.providerService.findByService(provider);
		const profile = await providerInstance.findUserByCode(code);

		console.log('profile', profile);

		const account = await this.prismaService.account.findFirst({
			where: { id: profile.id, provider: profile.provider }
		});

		let user = account?.userId
			? await this.userService.findById(account?.userId)
			: null;

		if (user) return this.saveSession(req, user);

		user = await this.userService.create({
			password: '',
			isVerified: true,
			email: profile.email,
			picture: profile.picture ,
			displayName: profile.name,
			method: AuthMethod[profile.provider.toUpperCase()]
		});

		if (!account) {
			await this.prismaService.account.create({
				data: {
					userId: user.id,
					type: 'oauth',
					provider: profile.provider,
					accessToken: profile.access_token,
					refreshToken: profile.refresh_token,
					expiresAt: profile.expires_at
				}
			});
		}

		return this.saveSession(req, user);
	}
}
