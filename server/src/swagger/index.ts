import yml from "yaml";
import fs from "fs";
import path from "path";

const file = fs.readFileSync(path.join(__dirname, "swagger.yml"), "utf-8");

export const swaggerDocument = yml.parse(file);
