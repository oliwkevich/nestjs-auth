import { DynamicModule, Module } from '@nestjs/common';

import {
	AsyncOptions,
	Options,
	ProviderOptionsSymbol
} from './provider.constants';
import { ProviderService } from './provider.service';

@Module({})
export class ProviderModule {
	public static register(options: Options): DynamicModule {
		return {
			module: ProviderModule,
			providers: [
				{
					useValue: options.services,
					provide: ProviderOptionsSymbol
				},
				ProviderService
			],
			exports: [ProviderService]
		};
	}

	public static registerAsync(options: AsyncOptions): DynamicModule {
		return {
			module: ProviderModule,
			providers: [
				{
					useFactory: options.useFactory,
					provide: ProviderOptionsSymbol,
					inject: options.inject
				},
				ProviderService
			],
			imports: options.imports,
			exports: [ProviderService]
		};
	}
}
