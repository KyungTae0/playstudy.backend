import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core.dto';
import { UsersModel } from '../models/users.model';

@InputType()
export class CreateAccountInput extends PickType(UsersModel, [`email`, 'password', 'Introduce', 'nick_name', 'profile_picture', 'social_url', 'authType']) {}

@InputType()
export class CreateSocialAccountInput extends PickType(UsersModel, [`email`, 'authType']) {}

@ObjectType()
export class CreateAccountOutput extends CoreOutput {}
