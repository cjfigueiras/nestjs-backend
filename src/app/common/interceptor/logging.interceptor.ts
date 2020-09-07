import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
//
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
//
import { ErrorCode } from '../error-manager/error-codes';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const now = Date.now();
        const req = context.switchToHttp().getRequest();

        if (req) {
            const method = req.method;
            const url = req.url;

            return next
                .handle()
                .pipe(
                    tap(() => {
                        Logger.log(`${method} ${url} ${Date.now() - now}ms`, context.getClass().name);
                        if (req.user) {
                            Logger.log(JSON.stringify({ email: req.user.email, role: req.user.role }));
                        }
                    }),
                    catchError((err) => {
                        Logger.error(`${method} ${url} ${Date.now() - now}ms`, context.getClass().name);
                        if (req.user) {
                            Logger.error(JSON.stringify({ email: req.user.email, role: req.user.role }));
                        }
                        if (err.response && err.response.code) {
                            Logger.error(`${err.status} ${err.response.code}: ${err.response.description}`);
                        } else if (err.response && err.response.message) {
                            Logger.error(`${err.status} ${ErrorCode.InvalidPayload}: ${err.response.message}`);
                        } else {
                            Logger.error(err);
                        }
                        return throwError(err);
                    }),
                );
        }
    }
}
