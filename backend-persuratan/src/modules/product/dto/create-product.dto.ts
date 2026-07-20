import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Kopi Kenangan Mantan', description: 'Nama dari produk' })
  @IsString()
  @IsNotEmpty({ message: 'Nama produk tidak boleh kosong' })
  name: string;

  @ApiProperty({ example: 15000, description: 'Harga produk' })
  @IsNumber()
  @Min(0, { message: 'Harga tidak boleh negatif' })
  price: number;
}
