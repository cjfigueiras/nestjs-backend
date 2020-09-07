import { User } from '../../../modules/user/user.entity';

export interface ILogin {
    readonly user: User;
    readonly token: string;
    readonly expiresIn: number;
}
