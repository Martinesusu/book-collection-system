import express from "express";
import authRouter from "./apps/auth.mjs";
import bookRouter from "./apps/books.mjs";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./utils/swagger.mjs";


async function init() {
  dotenv.config();

  const app = express();
  const port = 4000;


  app.use(express.json());
  app.use("/auth", authRouter);
  app.use("/books", bookRouter);
  app.use(bodyParser.json());
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


  app.get("/test", (req, res) => {
    return res.json("Server API is working");
  });

  app.listen(port, () => {
    console.log(`Server is running at ${port}`);
  });
}
init();
