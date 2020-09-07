import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Put,
    Param,
    Delete,
    UsePipes,
    UseInterceptors,
    Query,
    ClassSerializerInterceptor,
} from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidationPipe } from '../../common/pipes/validation.pipe';
import { RolesGuard } from '../../common/auth/guards/roles.guard';
import { ErrorResult } from '../../common/error-manager/errors';
import { ErrorManager } from '../../common/error-manager/error-manager';
import { User } from './user.entity';
import { GetUser } from '../../common/decorator/user.decorator';
import { JwtAuthGuard } from '../../common/auth/guards/auth.guard';
import { FilterUserDto } from './dto/filter-user.dto';
import { Roles } from '../../common/decorator/roles.decorator';
import { SentryInterceptor } from '../../common/interceptor/sentry-interceptor';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor, SentryInterceptor)
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Post()
    @Roles('root')
    @UsePipes(new ValidationPipe())
    create(@GetUser() reqUser: User, @Body() userDto: CreateUserDto) {
        return this.userService.create(userDto, reqUser)
            .then((createdUser: User) => {
                return createdUser;
            })
            .catch((error: ErrorResult) => {
                return ErrorManager.manageErrorResult(error);
            });
    }

    @Put(':id')
    @UsePipes(new ValidationPipe({ skipMissingProperties: true }))
    update(@GetUser() reqUser: User, @Param('userId') id: string, @Body() userDto: UpdateUserDto) {
        return this.userService.update(id, userDto, reqUser)
            .then((updatedScope: User) => {
                return updatedScope;
            })
            .catch((error: ErrorResult) => {
                return ErrorManager.manageErrorResult(error);
            });
    }

    @Get(':id')
    getUser(@GetUser() reqUser: User, @Param('id') id: string) {
        return this.userService.getUser(id, reqUser)
            .then((user: User) => {
                return user;
            })
            .catch((error: ErrorResult) => {
                return ErrorManager.manageErrorResult(error);
            });
    }

    @Get()
    getUsers(@GetUser() reqUser: User, @Query() filter: FilterUserDto) {
        return this.userService.getUsers(filter, reqUser)
            .then((scopes: User[]) => {
                return scopes;
            })
            .catch((error: ErrorResult) => {
                return ErrorManager.manageErrorResult(error);
            });
    }

    @Delete(':userId')
    delete(@GetUser() reqUser: User, @Param('userId') userId: string) {
        return this.userService.delete(userId, reqUser)
            .then((deletedScope: User) => {
                return deletedScope;
            })
            .catch((error: ErrorResult) => {
                return ErrorManager.manageErrorResult(error);
            });
    }
}
