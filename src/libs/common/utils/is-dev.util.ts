import { ConfigService } from '@nestjs/config'
import { config } from 'dotenv'

config()

export const isDev = (configService: ConfigService) =>
	configService.get<string>('NODE_ENV') === 'development'

export const IS_DEV_ENV = process.env.NODE_ENV === 'development'
