import { AuthMethod } from '@prisma/__generated__';

export interface CreateUser {
	email: string;
	password: string;
	displayName: string;
	picture: string;
	method: AuthMethod;
	isVerified: boolean;
}
