import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MinLength,
	Validate
} from 'class-validator';

import { IsPasswordsMatchingConstraint } from '@/libs/common/decorators/is-passwords-matching-constraint.decorator';

export class RegisterDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsEmail({})
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(6)
	password: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(6)
	@Validate(IsPasswordsMatchingConstraint)
	passwordRepeat: string;
}
