import Fastify from "fastify";
import multipart from "@fastify/multipart";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import cors from "@fastify/cors";

dotenv.config();

const app = Fastify({ logger: true });

// CORS
app.register(cors, { origin: "https://sueleneivan.netlify.app" });

// Multipart
app.register(multipart, {
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Array para armazenar metadados dos arquivos (para listar)
const uploadedFiles: {
  name: string;
  url: string;
  resource_type: string;
  format: string;
}[] = [];

// Rota de upload
app.post("/upload", async (req, reply) => {
  const data = await req.file();
  if (!data) return reply.status(400).send({ error: "Nenhum arquivo enviado" });

  try {
    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "meu_app_uploads", resource_type: "auto" },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      data.file.pipe(uploadStream);
    });

    // Salva metadados para listar depois
    uploadedFiles.push({
      name: data.filename,
      url: result.secure_url,
      resource_type: result.resource_type,
      format: result.format,
    });

    return reply.send({
      message: "Upload feito com sucesso!",
      file: uploadedFiles[uploadedFiles.length - 1],
    });
  } catch (err) {
    console.error(err);
    return reply.status(500).send({ error: "Erro ao fazer upload" });
  }
});

// Rota para listar arquivos
app.get("/files", async (req, reply) => {
  try {
    // Buscar imagens
    const images = await cloudinary.api.resources({
      type: "upload",
      prefix: "meu_app_uploads",
      max_results: 100,
      resource_type: "image",
    });

    // Buscar vídeos
    const videos = await cloudinary.api.resources({
      type: "upload",
      prefix: "meu_app_uploads",
      max_results: 100,
      resource_type: "video",
    });

    // Combina tudo
    const files = [...images.resources, ...videos.resources].map((f: any) => ({
      name: f.public_id.split("/").pop(),
      url: f.secure_url,
      resource_type: f.resource_type,
      format: f.format,
    }));

    return reply.send(files);
  } catch (err) {
    console.error(err);
    return reply.status(500).send({ error: "Erro ao buscar arquivos" });
  }
});
// Inicia servidor
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`🚀 Servidor rodando em ${address}`);
});
