import * as bcrypt from 'bcryptjs';
import { EntityRepository, Repository, Brackets } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './user.entity';
import { FilterUserDto } from './dto/filter-user.dto';

@EntityRepository(User)
export class UserRepository extends Repository<User> {

    async createUser(userDto: CreateUserDto) {
        const user: User = new User();
        user.firstName = userDto.firstName;
        user.lastName = userDto.lastName;
        user.email = userDto.email;
        const salt: string = bcrypt.genSaltSync(10);
        user.password = await bcrypt.hash(userDto.password, salt);
        user.role = UserRole[String(userDto.role).toUpperCase()];
        return this.save(user);
    }

    async updateUser(user: User, userDto: UpdateUserDto) {
        user.firstName = userDto.firstName ? userDto.firstName : user.firstName;
        user.lastName = userDto.lastName ? userDto.lastName : user.lastName;
        user.email = userDto.email ? userDto.email : user.email;
        user.phone = userDto.phone ? userDto.phone : user.phone;
        if (userDto.password) {
            const salt: string = bcrypt.genSaltSync(10);
            user.password = await bcrypt.hash(userDto.password, salt);
        }
        return this.save(user);
    }

    async updateUserPassword(user: User, password: string) {
        const salt: string = bcrypt.genSaltSync(10);
        user.password = await bcrypt.hash(password, salt);
        return this.save(user);
    }

    updateUserResetPasswordToken(user: User, token: string) {
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date();
        user.resetPasswordExpires.setDate(new Date().getDate() + 1);
        return this.save(user);
    }

    async signIn(email: string, password: string) {
        let user: User = await this.getUserByEmail(email);
        if (!user) {
            return null;
        }
        const isPasswordMatching = await bcrypt.compare(password, user.password);
        if (!isPasswordMatching) {
            user = null;
        }
        return user;
    }

    getUser(id: string, reqUser: User) {
        let query = this.createQueryBuilder('user')
            .select();

        if (reqUser && reqUser.role === UserRole.USER) {
            query = query
                .where('user.role = \'user\'');
        }

        return query
            .andWhere('user.id = :id', { id })
            .andWhere('user.isDeleted = false')
            .getOne();
    }

    getUsers(filter: FilterUserDto, reqUser: User) {
        let query = this.createQueryBuilder('user')
            .select();

        if (reqUser && reqUser.role === UserRole.USER) {
            query = query
                .where('user.role = \'user\'');
        }

        if (filter) {
            if (filter.name) {
                query = query.andWhere(new Brackets(
                    (qb) => {
                        return qb.where('LOWER(user.firstName) LIKE LOWER(:name)')
                            .andWhere('LOWER(user.lastName) LIKE LOWER(:name)', { name: '%' + filter.name + '%' });
                    }));
            }
            if (filter.email) {
                query = query.andWhere('user.email = :email', { email: filter.email });
            }
        }

        return query
            .andWhere('user.isDeleted = false')
            .getMany();
    }

    getUserByEmail(email: string) {
        return this.createQueryBuilder('user')
            .select()
            .leftJoinAndSelect('user.cosme', 'cosme')
            .where('user.email = :email', { email })
            .andWhere('user.isDeleted = false')
            .getOne();
    }

    getUserByToken(token: string) {
        return this.createQueryBuilder('user')
            .select()
            .where('user.resetPasswordToken = :token', { token })
            .andWhere('user.resetPasswordExpires >= :now', { now: new Date().toISOString() })
            .andWhere('user.isDeleted = false')
            .getOne();
    }

    deleteUser(user: User) {
        user.isDeleted = true;
        return this.save(user);
    }
}
