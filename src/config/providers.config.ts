import { ConfigService } from '@nestjs/config';

import { Options } from '@/auth/provider/provider.constants';
import { GoogleProvider } from '@/auth/provider/services/google-provider.service';

export const getProvidersConfig = async (
	configService: ConfigService
): Promise<Options> => ({
	baseUrl: configService.getOrThrow<string>('APPLICATION_URL'),
	services: [
		new GoogleProvider({
			client_id: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
			client_secret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
			scopes: ['email', 'profile']
		})
	]
});
