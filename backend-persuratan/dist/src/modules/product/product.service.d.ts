import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../../core/dto/pagination.dto';
export declare class ProductService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createProductDto: CreateProductDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        price: number;
        stock: number;
    }>;
    findAll(paginationDto: PaginationDto): Promise<{
        data: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            price: number;
            stock: number;
        }[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        price: number;
        stock: number;
    }>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        price: number;
        stock: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        price: number;
        stock: number;
    }>;
}
