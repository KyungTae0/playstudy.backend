// Application을 실행하기 위한 곳

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const allowlist = [`http://localhost:3000`, `http://localhost:3001`, `http://192.168.0.184:3000`]; //프론트 주소

async function bootstrap() {
  const app = await NestFactory.create(AppModule); //모든것이 AppModule로부터 시작됨
  app.enableCors({
    origin: allowlist, // 허락하고자 하는 요청 주소
    credentials: true, // true로 하면 설정한 내용을 response 헤더에 추가 해줍니다.이거없으면 cors걸림
  });
  app.useGlobalPipes(new ValidationPipe()); //Input 유효성 검사
  await app.listen(5050); //포트번호 5050
}
bootstrap();
