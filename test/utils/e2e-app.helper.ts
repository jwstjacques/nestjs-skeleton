import { AppModule } from "@app/app.module";
import { HttpExceptionFilter } from "@app/common/filters";
import { TestingModule } from "@nestjs/testing";
import { PrismaClient } from "@prisma/client";
import * as request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { TransformInterceptor } from "@app/common/interceptors/transform.interceptor";
import { PrismaModule } from "@app/database/prisma.module";
import { CorrelationService } from "@app/common/correlation";

export async function createApp(
  prismaClient: PrismaClient,
): Promise<[INestApplication, request.Agent]> {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule, PrismaModule.forTest(prismaClient)],
  }).compile();

  const app = moduleRef.createNestApplication();

  const correlationService = app.get(CorrelationService);

  app.useGlobalFilters(new HttpExceptionFilter(correlationService));
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.init();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const agent = request.agent(app.getHttpServer());

  return [app, agent];
}
