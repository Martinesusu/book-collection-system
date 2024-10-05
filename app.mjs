import express from "express";

async function init() {
  const app = express();
  const port = 4000;

  app.use(express.json());

  app.get("/test", (req, res) => {
    return res.json("Server API is working");
  });

  app.listen(port, () => {
    console.log(`Server is running at ${port}`);
  });
}
init();
