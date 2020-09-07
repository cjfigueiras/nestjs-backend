import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { CronModule } from 'nestjs-cron';

import { UserModule } from './app/modules/user/user.module';
import { ConfigService } from './app/common/config/config.service';
import { DatabaseModule } from './app/common/database/database.module';
import { LoggingInterceptor } from './app/common/interceptor/logging.interceptor';
import { EmailModule } from './app/common/email/email.module';

const configService = new ConfigService();

@Module({
    imports: [
        UserModule,
        DatabaseModule,
        CronModule.forRoot(),
        EmailModule,
    ],
    controllers: [],
    providers: [
        {
            provide: ConfigService,
            useValue: new ConfigService(),
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
    ],
})
export class AppModule { }
