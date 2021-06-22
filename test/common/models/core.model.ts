import { Field } from '@nestjs/graphql';
import { IsDate, IsNumber } from 'class-validator';

export class CoreModel {
  @Field((type) => Number)
  @IsNumber()
  id: number;

  @Field((type) => Date)
  @IsDate()
  createdAt: Date;

  @Field((type) => Date)
  @IsDate()
  updatedAt: Date;
}
