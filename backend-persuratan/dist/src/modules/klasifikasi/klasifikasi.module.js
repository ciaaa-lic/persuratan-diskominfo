"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KlasifikasiModule = void 0;
const common_1 = require("@nestjs/common");
const klasifikasi_service_1 = require("./klasifikasi.service");
const klasifikasi_controller_1 = require("./klasifikasi.controller");
let KlasifikasiModule = class KlasifikasiModule {
};
exports.KlasifikasiModule = KlasifikasiModule;
exports.KlasifikasiModule = KlasifikasiModule = __decorate([
    (0, common_1.Module)({
        controllers: [klasifikasi_controller_1.KlasifikasiController],
        providers: [klasifikasi_service_1.KlasifikasiService],
        exports: [klasifikasi_service_1.KlasifikasiService],
    })
], KlasifikasiModule);
//# sourceMappingURL=klasifikasi.module.js.map