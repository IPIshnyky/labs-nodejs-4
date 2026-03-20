import express from "express";
import morgan from "morgan";
import path from "path";
import taskRoutes from "./tasks/taskRoute.js";

const app = express();

app.use("/fonts/geist", express.static("node_modules/geist/dist/fonts"));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", path.join(import.meta.dirname, "views"));

app.get("/", (req, res) => res.render("index", { page: "home" }));

app.use("/tasks", taskRoutes);

app.use((req, res) => {
  res.status(404).sendFile(path.join(import.meta.dirname, "public/404.html"));
});

app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
