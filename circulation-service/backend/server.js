import express from "express";
import cors from "cors";
import os from "node:os";
import circulationRoutes from "./routes/circulation.routes.js";

const app = express();
const PORT = 5002;

function getLanIp() {
  const virtualAdapterPattern = /virtual|vethernet|wsl|docker|vpn|loopback|bluetooth/i;
  const interfaces = Object.entries(os.networkInterfaces())
    .flatMap(([name, addresses]) => (addresses || []).map((address) => ({ name, ...address })))
    .filter((address) => address.family === "IPv4" && !address.internal);
  const physicalAddresses = interfaces
    .filter((address) => !virtualAdapterPattern.test(address.name))
    .map((address) => address.address);
  const addresses = physicalAddresses.length > 0
    ? physicalAddresses
    : interfaces.map((address) => address.address);

  return addresses.find((address) => address.startsWith("192.168."))
    || addresses.find((address) => /^172\.(1[6-9]|2\d|3[01])\./.test(address))
    || addresses.find((address) => address.startsWith("10."))
    || addresses[0]
    || "127.0.0.1";
}

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Private-Network", "true");
  next();
});

app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Circulation Service",
    port: PORT
  });
});

app.use("/api", circulationRoutes);

const server = app.listen(PORT, "0.0.0.0");

server.on("listening", () => {
  const lanIp = getLanIp();

  console.log(`Local URL: http://localhost:${PORT}`);
  console.log(`LAN URL: http://${lanIp}:${PORT}`);
  console.log(`Health Check: http://${lanIp}:${PORT}/health`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} đang được sử dụng. Hãy dừng process cũ rồi chạy lại backend.`);
    return;
  }

  throw error;
});
