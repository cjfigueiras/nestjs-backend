import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as generator from 'generate-password';

import { AuthService } from '../../common/auth/auth.service';
import { ILogin } from '../../common/auth/interfaces/login.interface';
import { ConfigService } from '../../common/config/config.service';
import { EmailService } from '../../common/email/email.service';
import { IDataEmail } from '../../common/email/interfaces/data-email.interface';
import { ErrorCode } from '../../common/error-manager/error-codes';
import { ErrorManager } from '../../common/error-manager/error-manager';
import {
    BadRequestResult,
    ErrorResult,
    ForbiddenResult,
    InternalServerErrorResult,
    NotFoundResult,
} from '../../common/error-manager/errors';
import { CreateUserDto } from './dto/create-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: UserRepository,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly emailService: EmailService,
    ) { }

    create(userDto: CreateUserDto, reqUser?: User): Promise<User> {
        return new Promise((resolve: (result: User) => void, reject: (reason: ErrorResult) => void): void => {
            // User request not Super Admin trying of create an user Super Admin
            if (reqUser && reqUser.role !== UserRole.ROOT && userDto.role === UserRole.ROOT) {
                reject(new ForbiddenResult(ErrorCode.MissingPermission, 'You can not create a Super Admin User'));
                return;
            }
            this.userRepository.getUserByEmail(userDto.email).then((user: User) => {
                if (user) {
                    reject(new BadRequestResult(ErrorCode.DuplicateEntity, 'There is an user with same email!'));
                    return;
                }
                const hasPassword: boolean = (userDto.password ? true : false);
                if (!hasPassword) {
                    userDto.password = generator.generate({
                        length: 10,
                        numbers: true,
                    });
                }

                this.userRepository.createUser(userDto).then((createdUser: User) => {
                    if (!hasPassword) {
                        this.sendRecoveryPasswordEmail(createdUser, userDto.replyUrl, true);
                    }
                    resolve(createdUser);
                }).catch((error) => {
                    reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
                });
            }).catch((error) => {
                reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
            });
        });
    }

    async sendRecoveryPasswordEmail(user: User, replyUrl: string, newAccount: boolean, language?: string): Promise<any> {
        const data: any = {
            userId: user.id,
            token: user.resetPasswordToken,
        };
        const queryParams = language ? `?lang=${language}` : 'en';
        const encodedObject = Buffer.from(JSON.stringify(data)).toString('base64');
        const url: string = `${replyUrl}/${encodedObject.substring(0, encodedObject.indexOf('='))}${queryParams}`;
        return this.emailService.sendMail(this.getRecoveryEmailTemplate(user, url, newAccount, language));
    }

    getRecoveryEmailTemplate(user: User, url: string, newAccount: boolean, language: string): IDataEmail {
        return {
            to: user.email,
            from: this.configService.get('MAIL_USER'),
            ...(newAccount && { template: 'Register' }),
            ...(!newAccount && { template: 'ResetPassword' }),
            ...(newAccount && {
                dynamicTemplateData: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    buttonUrl: url,
                },
            }),
            language,
            ...(!newAccount && {
                dynamicTemplateData: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    buttonUrl: url,
                },
            }),
        };
    }


    update(id: string, userDto: UpdateUserDto, reqUser: User): Promise<User> {
        return new Promise((resolve: (result: User) => void, reject: (reason: ErrorResult) => void): void => {
            // User request not Super Admin trying of create an user Super Admin
            if (reqUser.role !== UserRole.ROOT && userDto.role === UserRole.ROOT) {
                reject(new ForbiddenResult(ErrorCode.MissingPermission, 'You cant not create a Super Admin User'));
                return;
            }
            this.userRepository.getUser(id, reqUser).then((user: User) => {
                if (!user) {
                    reject(new NotFoundResult(ErrorCode.UnknownEntity, 'There is no user with the specified ID!'));
                    return;
                }
                this.userRepository.getUserByEmail(userDto.email).then((userEmail: User) => {
                    if (userEmail && userEmail.id !== user.id) {
                        reject(new BadRequestResult(ErrorCode.UnknownEntity, 'There is a user with same email!'));
                        return;
                    }
                    this.userRepository.updateUser(user, userDto).then((updatedUser: User) => {
                        resolve(updatedUser);
                    }).catch((error) => {
                        reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
                    });
                }).catch((error) => {
                    reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
                });
            }).catch(error => {
                reject(error);
            });
        });
    }

    getUser(id: string, reqUser: User): Promise<User> {
        return new Promise((resolve: (result: User) => void, reject: (reason: ErrorResult) => void): void => {
            if (id === reqUser.id) {
                resolve(reqUser);
                return;
            }
            this.userRepository.getUser(id, reqUser).then((user: User) => {
                if (!user) {
                    reject(new NotFoundResult(ErrorCode.UnknownEntity, 'There is no user with the specified ID!'));
                    return;
                }
                resolve(user);
            }).catch((error) => {
                reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
            });
        });
    }



    getUsers(filter: FilterUserDto, reqUser: User): Promise<User[]> {
        return new Promise((resolve: (result: User[]) => void, reject: (reason: ErrorResult) => void): void => {
            this.userRepository.getUsers(filter, reqUser).then((users: User[]) => {
                resolve(users);
            }).catch((error) => {
                reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
            });
        });
    }

    delete(id: string, reqUser: User): Promise<User> {
        return new Promise((resolve: (result: User) => void, reject: (reason: ErrorResult) => void): void => {
            this.userRepository.getUser(id, reqUser).then((user: User) => {
                this.deleteUser(user).then((deletedUser: User) => {
                    resolve(deletedUser);
                }).catch(error => {
                    reject(error);
                });
            }).catch((error) => {
                reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
            });
        });
    }

    deleteUsers(scopes: User[]) {
        return Promise.all(scopes.map(scope => {
            return this.deleteUser(scope);
        }));
    }

    deleteUser(user: User): Promise<User> {
        return new Promise((resolve: (result: User) => void, reject: (reason: ErrorResult) => void): void => {
            this.userRepository.deleteUser(user).then((deletedUser: User) => {
                resolve(deletedUser);
            }).catch(error => {
                reject(error);
            });
        });
    }

    signIn(email: string, password: string, origin?: string): Promise<User> {
        return new Promise((resolve: (result: User) => void, reject: (reason: ErrorResult) => void): void => {
            this.userRepository.signIn(email, password).then((user: User) => {
                if (!user) {
                    reject(new ForbiddenResult(ErrorCode.UnknownEntity, 'Invalid credentials!'));
                    return;
                }
                resolve(user);
            }).catch((error) => {
                reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
            });
        });
    }

    forgotPassword(email: string, replyUrl: string): Promise<string> {
        return new Promise((resolve: (result: string) => void, reject: (reason: ErrorResult) => void): void => {
            this.userRepository.getUserByEmail(email).then(async (user: User) => {
                if (!user) {
                    reject(new NotFoundResult(ErrorCode.UnknownEntity, 'There is no user with the specified email!'));
                    return;
                }

                const token: string = require('crypto').randomBytes(20).toString('hex');
                this.userRepository.updateUserResetPasswordToken(user, token).then((updatedUser: User) => {
                    this.sendRecoveryPasswordEmail(updatedUser, replyUrl, false).then(() => {
                        resolve('Email sent');
                    }).catch((error) => {
                        reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
                    });
                }).catch((error) => {
                    reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
                });
            }).catch((error) => {
                reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
            });
        });
    }

    resetPassword(token: string, password: string): Promise<string> {
        return new Promise((resolve: (result: string) => void, reject: (reason: ErrorResult) => void): void => {
            this.userRepository.getUserByToken(token).then((user: User) => {
                if (!user) {
                    reject(new NotFoundResult(ErrorCode.UnknownEntity, 'Token invalid or expired!'));
                    return;
                }
                this.userRepository.updateUserPassword(user, password).then(() => {
                    const email: IDataEmail = {
                        to: user.email,
                        from: this.configService.get('MAIL_USER'),
                        template: 'PasswordModified',
                        language: 'en',
                        dynamicTemplateData: {
                            firstName: user.firstName,
                            lastName: user.lastName,
                        },
                    };

                    this.emailService.sendMail(email).then((response) => {
                        Logger.log(response);
                        resolve('Email sent!');
                    }).catch((error) => {
                        Logger.error(error);
                        reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
                    });
                }).catch((error) => {
                    reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
                });
            }).catch((error) => {
                reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
            });
        });
    }

    getUserByEmail(email: string, toCheckIfExist?: boolean): Promise<User> {
        return new Promise((resolve: (result: User) => void, reject: (reason: ErrorResult) => void): void => {
            this.userRepository.getUserByEmail(email).then((user: User) => {
                if (toCheckIfExist) {
                    resolve(user);
                }
                if (!user) {
                    reject(new NotFoundResult(ErrorCode.UnknownEntity, 'There is no user with the specified email!'));
                    return;
                }
                resolve(user);
            }).catch((error) => {
                reject(new InternalServerErrorResult(ErrorCode.GeneralError, error));
            });
        });
    }
}
