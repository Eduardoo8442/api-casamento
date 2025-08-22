"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fastify_1 = __importDefault(require("fastify"));
var multipart_1 = __importDefault(require("@fastify/multipart"));
var cloudinary_1 = require("cloudinary");
var dotenv_1 = __importDefault(require("dotenv"));
var cors_1 = __importDefault(require("@fastify/cors"));
dotenv_1.default.config();
var app = (0, fastify_1.default)({ logger: true });
// CORS
app.register(cors_1.default, { origin: "https://sueleneivan.netlify.app" });
// Multipart
app.register(multipart_1.default, {
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});
// Configuração do Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Array para armazenar metadados dos arquivos (para listar)
var uploadedFiles = [];
// Rota de upload
app.post("/upload", function (req, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var data, result, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, req.file()];
            case 1:
                data = _a.sent();
                if (!data)
                    return [2 /*return*/, reply.status(400).send({ error: "Nenhum arquivo enviado" })];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, new Promise(function (resolve, reject) {
                        var uploadStream = cloudinary_1.v2.uploader.upload_stream({ folder: "meu_app_uploads", resource_type: "auto" }, function (err, result) { return (err ? reject(err) : resolve(result)); });
                        data.file.pipe(uploadStream);
                    })];
            case 3:
                result = _a.sent();
                // Salva metadados para listar depois
                uploadedFiles.push({
                    name: data.filename,
                    url: result.secure_url,
                    resource_type: result.resource_type,
                    format: result.format,
                });
                return [2 /*return*/, reply.send({
                        message: "Upload feito com sucesso!",
                        file: uploadedFiles[uploadedFiles.length - 1],
                    })];
            case 4:
                err_1 = _a.sent();
                console.error(err_1);
                return [2 /*return*/, reply.status(500).send({ error: "Erro ao fazer upload" })];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Rota para listar arquivos
app.get("/files", function (req, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var images, videos, files, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, cloudinary_1.v2.api.resources({
                        type: "upload",
                        prefix: "meu_app_uploads",
                        max_results: 100,
                        resource_type: "image",
                    })];
            case 1:
                images = _a.sent();
                return [4 /*yield*/, cloudinary_1.v2.api.resources({
                        type: "upload",
                        prefix: "meu_app_uploads",
                        max_results: 100,
                        resource_type: "video",
                    })];
            case 2:
                videos = _a.sent();
                files = __spreadArray(__spreadArray([], images.resources, true), videos.resources, true).map(function (f) { return ({
                    name: f.public_id.split("/").pop(),
                    url: f.secure_url,
                    resource_type: f.resource_type,
                    format: f.format,
                }); });
                return [2 /*return*/, reply.send(files)];
            case 3:
                err_2 = _a.sent();
                console.error(err_2);
                return [2 /*return*/, reply.status(500).send({ error: "Erro ao buscar arquivos" })];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Inicia servidor
var PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen({ port: PORT, host: "0.0.0.0" }, function (err, address) {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
    console.log("\uD83D\uDE80 Servidor rodando em ".concat(address));
});
