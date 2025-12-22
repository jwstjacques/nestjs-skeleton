import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AppDal } from "./app.dal";
import { AppConfigModule } from "./config";
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
import { CustomThrottlerGuard } from "./common/guards/custom-throttler.guard";

@Module({
  imports: [
    // Use new centralized config module
    AppConfigModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: "short",
          ttl: config.get<number>("throttle.short.ttl", 1000),
          limit: config.get<number>("throttle.short.limit", 10),
        },
        {
          name: "medium",
          ttl: config.get<number>("throttle.medium.ttl", 10000),
          limit: config.get<number>("throttle.medium.limit", 50),
        },
        {
          name: "long",
          ttl: config.get<number>("throttle.long.ttl", 60000),
          limit: config.get<number>("throttle.long.limit", 200),
        },
        {
          name: "strict",
          ttl: config.get<number>("throttle.strict.ttl", 900000),
          limit: config.get<number>("throttle.strict.limit", 5),
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
      useClass: CustomThrottlerGuard,
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
