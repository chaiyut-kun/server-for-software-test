import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
  username: "myuser",
  password: "mypassword",
  database: "mydatabase",
  port: 5432,
  host: "localhost",
  dialect: "postgres",
});
