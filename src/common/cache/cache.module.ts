import { Module, Global, Logger } from "@nestjs/common";
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-yet";

const logger = new Logger("CacheModule");

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        try {
          const store = await redisStore({
            socket: {
              host: configService.get<string>("cache.redis.host", "localhost"),
              port: configService.get<number>("cache.redis.port", 6379),
            },
            password: configService.get<string>("cache.redis.password"),
            database: configService.get<number>("cache.redis.db", 0),
          });

          logger.log("Redis cache store connected successfully");

          return { store };
        } catch (error) {
          logger.warn(
            `Redis unavailable, falling back to in-memory cache: ${(error as Error).message}`,
          );

          return {
            ttl: 300,
          };
        }
      },
      inject: [ConfigService],
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
