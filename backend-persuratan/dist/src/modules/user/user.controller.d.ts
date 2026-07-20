import { UserService } from './user.service';
interface AuthenticatedRequest {
    user: {
        userId: number;
        email: string;
        role: string;
    };
}
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(req: AuthenticatedRequest): Promise<Record<string, unknown> | null>;
    updateProfile(req: AuthenticatedRequest, body: {
        name?: string;
        password?: string;
    }): Promise<Record<string, unknown>>;
    changePassword(req: AuthenticatedRequest, body: {
        oldPassword?: string;
        newPassword?: string;
    }): Promise<{
        message: string;
    }>;
}
export {};
