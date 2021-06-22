import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core.dto';
import { UsersModel } from '../models/users.model';

@InputType()
export class CheckUserInput extends PickType(UsersModel, [`email`, `authType`]) {}

@ObjectType()
export class CheckOutput extends CoreOutput {}
