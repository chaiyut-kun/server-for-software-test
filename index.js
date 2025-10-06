import express from "express";
import { sequelize } from "./config/database.js";
import { Users } from "./model/user.js";
import cors from 'cors'

const app = express();
const PORT = 3000;

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  methods:  ["GET", "POST", "PUT", "DELETE"],
  credentials: true // ถ้ามีการใช้ cookie หรือ auth header(เช่น bearer จาก jwt)

}))
app.use(express.urlencoded({ extended: true }));

// sequelize ORM
sequelize
  .authenticate()
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log("Error connecting to database", err));

//  API endpoints
app.get("/", (req, res) => {
  res.send("Helloworld");
});

app.post("/login", async (req, res) => {
  const user = req.body;
  const email = user.email;

  console.log(email)
  
  try {
      const findUser = await Users.findOne({
          where: { email: email },
        });

      const username = findUser.dataValues.name
        
    res.status(200).json({
      message: `Login Successfully!, Welcome ${username}`,
      data: findUser,
    });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

app.post("/register", async (req, res) => {
  //   const token = "token";
  const user = req.body;

  try {
    const createUser = await Users.create(user);

    res.status(201).json({
      message: `Register Successfully!, ${user.name}`,
      data: createUser,
    });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

//
app.listen(PORT, () => {
  console.log(`Server Is Running On Port ${PORT}`);
});
