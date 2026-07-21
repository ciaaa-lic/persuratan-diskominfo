import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: RegisterDto): Promise<{
        id: number;
        email: string;
        password: string;
        name: string;
        role: string;
        bidang: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(body: LoginDto): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
            name: string;
            role: string;
            bidang: string | null;
        };
    }>;
}
