import yml from "yaml";
import fs from "fs";

const file = fs.readFileSync("./src/swagger/swagger.yml", "utf-8");

export const swaggerDocument = yml.parse(file);
