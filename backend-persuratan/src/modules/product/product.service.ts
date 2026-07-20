import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../../core/dto/pagination.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
      }),
      this.prisma.product.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Product dengan ID ${id} tidak ditemukan`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    // Validasi apakah produk ada
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: number) {
    // Validasi apakah produk ada
    await this.findOne(id);

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
