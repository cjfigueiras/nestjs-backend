import { Global, Module, Logger } from '@nestjs/common';

import { ConfigService } from '../config/config.service';
import { EmailService } from './email.service';

const configService = new ConfigService();

@Global()
@Module({
    imports: [],
    providers: [EmailService, ConfigService, Logger],
    exports: [EmailService],
})
export class EmailModule { }
