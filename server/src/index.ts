import { createApp } from "./app.js";

const PORT = Number(process.env.PORT ?? 8080);

const app = createApp();
app.listen(PORT, "0.0.0.0", () => {
  process.stdout.write(`http://localhost:${PORT}\n`);
});

