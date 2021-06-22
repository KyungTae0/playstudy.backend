import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DatabaseService } from 'src/database/database.service';
import { CreateAccountInput, CreateAccountOutput } from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UsersModel } from './models/users.model';
import { UsersService } from './users.service';

@Resolver(() => UsersModel)
export class UsersResolver {
  constructor(private readonly usersService: UsersService, private readonly databaseService: DatabaseService) {}

  @Query((returns) => Boolean)
  hi() {
    return true;
  }
  /* 회원가입
    mutation{
      createAccount(input:{
        email:""
        password: ""
      })
      {
        ok
        error
      }
    }
    */
  @Mutation((returns) => CreateAccountOutput)
  async createAccount(@Args(`input`) createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const { success, error } = await this.usersService.createAccount(createAccountInput);
      //Go는 Error를 Throw하지 않고 Return한다. 이럴 경우 Error를 조종하는게 가능하다
      return {
        success,
        error,
      };
    } catch (e) {
      return {
        success: false,
        error: e,
      };
    }
  }

  /* 로그인
    mutation{
    login(input:{
        email:"",
        password:""
    })
    {
        success
        error
        token
    }
    }
    */
  @Mutation((returns) => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    try {
      return await this.usersService.login(loginInput);
    } catch (e) {
      return {
        success: false,
        error: e,
      };
    }
  }
}
