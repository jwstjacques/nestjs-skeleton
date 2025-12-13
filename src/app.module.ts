import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AppDal } from "./app.dal";
import { DatabaseModule } from "./database/database.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { CacheModule } from "./common/cache/cache.module";
import { LoggerModule } from "./common/logger/logger.module";
import { CorrelationModule } from "./common/correlation";
import { CorrelationIdMiddleware, RequestLoggerMiddleware } from "./common/middleware";
import { HttpCacheInterceptor, PerformanceInterceptor } from "./common/interceptors";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { RolesGuard } from "./auth/guards/roles.guard";
import paginationConfig from "./config/pagination.config";
import throttlerConfig from "./config/throttler.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      load: [paginationConfig, throttlerConfig],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: "short",
          ttl: config.get<number>("throttler.short.ttl", 1000),
          limit: config.get<number>("throttler.short.limit", 10),
        },
        {
          name: "medium",
          ttl: config.get<number>("throttler.medium.ttl", 10000),
          limit: config.get<number>("throttler.medium.limit", 50),
        },
        {
          name: "long",
          ttl: config.get<number>("throttler.long.ttl", 60000),
          limit: config.get<number>("throttler.long.limit", 200),
        },
      ],
    }),
    CorrelationModule,
    LoggerModule,
    CacheModule,
    DatabaseModule,
    AuthModule,
    TasksModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppDal,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Apply JWT authentication globally
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Apply role-based access control globally
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply correlation ID middleware first to generate/validate correlation IDs
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
    // Apply request logger middleware second to log with correlation IDs
    consumer.apply(RequestLoggerMiddleware).forRoutes("*");
  }
}
