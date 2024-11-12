import {
	BadRequestException,
	Injectable,
	UnauthorizedException
} from '@nestjs/common';

import { BaseProviderOptions } from './types/base-provider-options.type';
import { UserInfo } from './types/user-info.type';

@Injectable()
export class BaseOAuthService {
	private BASE_URL: string;

	public constructor(private readonly options: BaseProviderOptions) {}

	public getRedirectUrl() {
		return `${this.BASE_URL}/auth/oauth/callback/${this.options.name}`;
	}

	protected async extractUserInfo(data: any): Promise<UserInfo> {
		return {
			...data,
			provider: this.options.name
		};
	}

	public getAuthUrl() {
		const query = new URLSearchParams({
			response_type: 'code',
			client_id: this.options.client_id,
			redirect_uri: this.getRedirectUrl(),
			scope: (this.options.scopes ?? []).join(' '),
			access_type: 'offline',
			prompt: 'select_account'
		});

		return `${this.options.authorize_url}?${query}`;
	}

	public async findUserByCode(code: string): Promise<UserInfo> {
		const client_id = this.options.client_id;
		const client_secret = this.options.client_secret;

		const tokenQuery = new URLSearchParams({
			code,
			client_id,
			client_secret,
			redirect_uri: this.getRedirectUrl(),
			grant_type: 'authorization_code'
		});

		const tokenRequest = await fetch(this.options.access_url, {
			method: 'POST',
			body: tokenQuery,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Accept: 'application/json'
			}
		});

		if (!tokenRequest.ok) throw new BadRequestException('Bad Request #2');

		const tokens = await tokenRequest.json();

		if (!tokens.access_token) {
			throw new BadRequestException('Not tokens from access_url');
		}

		const userRequest = await fetch(this.options.profile_url, {
			headers: {
				Authorization: `Bearer ${tokens.access_token}`
			}
		});

		if (!userRequest.ok) {
			throw new UnauthorizedException(
				`No information about user: ${this.options.profile_url} `
			);
		}

		const user = await userRequest.json();
		const userData = await this.extractUserInfo(user);

		return {
			...userData,
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token,
			expires_at: tokens.expires_at || tokens.expires_in,
			provider: this.options.name
		};
	}

	set baseUrl(value: string) {
		this.BASE_URL = value;
	}

	get name() {
		return this.options.name;
	}

	get accessUrl() {
		return this.options.access_url;
	}

	get profileUrl() {
		return this.options.profile_url;
	}

	get scopes() {
		return this.options.scopes;
	}
}
