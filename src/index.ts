import Fastify from "fastify";
import multer from "fastify-multer";
import path from "path";
import fs from "fs";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import fastifyMultipart from "@fastify/multipart";
import dotenv from 'dotenv';
dotenv.config();
const app = Fastify({ logger: true });

// CORS
app.register(cors, {
  origin: ["https://sueleneivan.netlify.app"],
  methods: ["GET", "POST"],
});

// Pasta uploads
const uploadFolder = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// Multer config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadFolder),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Parser multipart
app.register(fastifyMultipart);

// Upload
app.post("/upload", { preHandler: upload.single("file") }, async (req, reply) => {
  const file = (req as any).file;
  if (!file) {
    return reply.status(400).send({ error: "Nenhum arquivo enviado" });
  }

  return {
    message: "Arquivo enviado com sucesso!",
    file: {
      name: file.filename,
      url: `/uploads/${file.filename}`,
    },
  };
});

// Listar arquivos
app.get("/files", async () => {
  const files = fs.readdirSync(uploadFolder);
  return files.map((file) => ({
    name: file,
    url: `/uploads/${file}`,
  }));
});

// Servir arquivos estáticos
app.register(fastifyStatic, {
  root: uploadFolder,
  prefix: "/uploads/",
});

// Start
const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const start = async () => {
  try {
  await app.listen({ port, host: "0.0.0.0" });
console.log(`Servidor rodando na porta ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
