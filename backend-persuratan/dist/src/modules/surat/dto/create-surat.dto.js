"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSuratBatchDto = exports.CreateSuratItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateSuratItemDto {
    pengirim;
    perihal;
    bidang;
    tanggalSurat;
    klasifikasi;
    kodeKlasifikasi;
    lampiran;
}
exports.CreateSuratItemDto = CreateSuratItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Kepala Bidang APTIKA' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSuratItemDto.prototype, "pengirim", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Undangan Rapat Koordinasi TIK' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSuratItemDto.prototype, "perihal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'APTIKA' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSuratItemDto.prototype, "bidang", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-07-17' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSuratItemDto.prototype, "tanggalSurat", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Biasa' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSuratItemDto.prototype, "klasifikasi", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '486' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSuratItemDto.prototype, "kodeKlasifikasi", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '/uploads/surat-123.pdf' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSuratItemDto.prototype, "lampiran", void 0);
class CreateSuratBatchDto {
    batchList;
}
exports.CreateSuratBatchDto = CreateSuratBatchDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CreateSuratItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateSuratItemDto),
    __metadata("design:type", Array)
], CreateSuratBatchDto.prototype, "batchList", void 0);
//# sourceMappingURL=create-surat.dto.js.map