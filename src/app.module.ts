//main.ts로 import 되는 유일한 Module

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';

import * as Joi from 'joi';

import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { KakaoModule } from './kakao/kakao.module';
import { AuthModule } from './auth/auth.module';
import { GoogleModule } from './google/google.module';
import { JwtModule } from './jwt/jwt.module';

@Module({
  imports: [
    //#TODO 정의 정리하기forRoot Method

    //dotenv는 .env 파일에서 환경 변수를 로드하는데 process.env.X 이렇게 접근가능하다
    //@nestjs/config Module은 dotenv를 내부에서 사용 할 수 있다.
    ConfigModule.forRoot({
      isGlobal: true, //어디서나 config module 접근 가능하게 함
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.stag',
      ignoreEnvFile: process.env.NODE_ENV === 'prod', //prod 환경일때는 ConfigModule이 env파일 무시
      //스키마 유효성검사
      //joi는 자바스크립트용의 가장 강력한 스키마 설명 언어이자 데이터 유효성 검사 툴입니다.
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').required(), //NODE_ENV가 dev,prod가 아닐때 에러발생시킨다
        JWT_SECRET_KEY: Joi.string().required(),
        AWS_RDS_DB_HOST: Joi.string().required(),
        AWS_RDS_DB_PORT: Joi.string().required(),
        AWS_RDS_DB_USERNAME: Joi.string().required(),
        AWS_RDS_DB_PASSWORD: Joi.string().required(),
        AWS_RDS_DB_DATABASE: Joi.string().required(),
        KAKAO_ACCESS_KEY: Joi.string().required(),
      }),
    }),

    GraphQLModule.forRoot({
      //schema 파일 생성
      //autoSchemaFile: join(process.cwd(), 'src/schema.graphql'),
      autoSchemaFile: true, //파일을 메모리에 만들기 떄문에 따로 가지고 있지 않아도 된다.
      sortSchema: true, //Schema를 사전 순으로 정렬
      playground: true,
      debug: true,
      context: ({ req, connection }) => {
        const TOKEN_KEY = 'token';
        return {
          token: req ? req.headers[TOKEN_KEY] : connection.context[TOKEN_KEY],
        };
      },
    }),
    UsersModule,
    CommonModule,
    DatabaseModule.forRoot({
      host: process.env.AWS_RDS_DB_HOST,
      user: process.env.AWS_RDS_DB_USERNAME,
      password: process.env.AWS_RDS_DB_PASSWORD,
      database: process.env.AWS_RDS_DB_DATABASE,
      //pool 옵션
      waitForConnections: true, // 사용 가능한 연결이없고 한계에 도달했을 때 풀의 동작을 결정합니다. 그 경우 true, 풀은 접속 요구를 큐에 넣어, 이용 가능하게되었을 때에 접속 요구를 호출합니다. false의 경우 false, 풀은 즉시 에러로 콜백합니다. (기본값 : true)
      connectTimeout: 10000, // MySQL 서버에 처음 연결하는 동안 시간 초과가 발생하기 전의 밀리 초. (기본값 : 10000)
      queueLimit: 3000, // getConnection에서 오류를 반환하기 전에 풀에서 대기열에 넣을 최대 연결 요청 수입니다. 0으로 설정하면 대기 중인 연결 요청 수에 제한이 없습니다. (기본값: 0)
      connectionLimit: 10, //한 번에 생성할 최대 연결 수. (기본값: 10)
    }),
    KakaoModule,
    AuthModule,
    GoogleModule,
    JwtModule.forRoot({
      privateKey: process.env.JWT_SECRET_KEY,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
