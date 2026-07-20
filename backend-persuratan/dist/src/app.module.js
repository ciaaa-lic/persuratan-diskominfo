"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Joi = __importStar(require("joi"));
const product_module_1 = require("./modules/product/product.module");
const user_module_1 = require("./modules/user/user.module");
const auth_module_1 = require("./modules/auth/auth.module");
const admin_module_1 = require("./modules/admin/admin.module");
const prisma_module_1 = require("./core/prisma/prisma.module");
const klasifikasi_module_1 = require("./modules/klasifikasi/klasifikasi.module");
const libur_module_1 = require("./modules/libur/libur.module");
const stok_module_1 = require("./modules/stok/stok.module");
const surat_module_1 = require("./modules/surat/surat.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const log_module_1 = require("./modules/log/log.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validationSchema: Joi.object({
                    DATABASE_URL: Joi.string().required(),
                    JWT_SECRET: Joi.string().required(),
                }),
            }),
            prisma_module_1.PrismaModule,
            product_module_1.ProductModule,
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            admin_module_1.AdminModule,
            klasifikasi_module_1.KlasifikasiModule,
            libur_module_1.LiburModule,
            stok_module_1.StokModule,
            surat_module_1.SuratModule,
            dashboard_module_1.DashboardModule,
            log_module_1.LogModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map