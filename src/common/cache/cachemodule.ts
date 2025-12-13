import { Module, Global } from "@nestjs/common";
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-yet";

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>("REDIS_HOST", "localhost"),
            port: configService.get<number>("REDIS_PORT", 6379),
          },
          ttl: configService.get<number>("REDIS_TTL", 30000),
        }),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
