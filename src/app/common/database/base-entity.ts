import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Exclude()
    @Column({ default: false })
    isDeleted?: boolean;

    @Column()
    @CreateDateColumn()
    createdAt?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;
}
