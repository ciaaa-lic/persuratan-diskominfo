import { LogService } from './log.service';
export declare class LogController {
    private readonly logService;
    constructor(logService: LogService);
    findAll(limit?: string): Promise<{
        id: number;
        role: string;
        createdAt: Date;
        description: string;
        userId: number | null;
        userName: string;
        action: string;
    }[]>;
}
