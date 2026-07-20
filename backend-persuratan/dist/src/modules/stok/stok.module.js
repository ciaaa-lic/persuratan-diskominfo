"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StokModule = void 0;
const common_1 = require("@nestjs/common");
const stok_service_1 = require("./stok.service");
const stok_controller_1 = require("./stok.controller");
let StokModule = class StokModule {
};
exports.StokModule = StokModule;
exports.StokModule = StokModule = __decorate([
    (0, common_1.Module)({
        controllers: [stok_controller_1.StokController],
        providers: [stok_service_1.StokService],
        exports: [stok_service_1.StokService],
    })
], StokModule);
//# sourceMappingURL=stok.module.js.map