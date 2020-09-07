import { Exclude } from 'class-transformer';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../../common/database/base-entity';

export enum UserRole {
    ROOT = 'root',
    USER = 'user',
}

@Entity()
export class User extends BaseEntity {

    @Column({ length: 50 })
    firstName: string;

    @Column({ length: 50 })
    lastName: string;

    @Column()
    email: string;

    @Exclude({ toPlainOnly: true })
    @Column()
    password: string;

    @Column({ nullable: true })
    phone: string;

    @Exclude()
    @Column({ nullable: true })
    resetPasswordToken: string;

    @Exclude()
    @Column({ nullable: true })
    resetPasswordExpires: Date;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;
}
