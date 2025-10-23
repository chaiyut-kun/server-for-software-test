import express from "express";
import { sequelize } from "./config/database.js";
import { Users } from "./model/user.js";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import { historyLogin, historyRegister } from "./webhook_fn.js";

const app = express();
dotenv.config();
const PORT = 3000;
const secret = process.env.SECRET_CODE;
const webhook = process.env.N8N_WEBHOOK_URL;
const webhookTest = process.env.N8N_WEBHOOK_URL_TEST;

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // ถ้ามีการใช้ cookie หรือ auth header(เช่น bearer จาก jwt)
  })
);
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

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  // console.log("token", token);

  if (token === null) {
    // unauthorized
    return res.sendStatus(401);
  }

  try {
    const user = jwt.verify(token, secret);
    req.user = user;
    console.log("user", user);
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: "You are not authorized to view this content." });
  }
};

// @==== get users ======
app.get("/api/users", authenticateToken, async (req, res) => {
  const users = await Users.findAll();
  res.status(200).json({
    data: users,
    message: "Get users SuccessFully",
  });
});

// @==== Login ======
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  let status;

  try {
    const findUser = await Users.findOne({
      where: { email: email },
    });

    if (!findUser) {
      status = "Fail";
      return res.status(404).json({
        message: "No account found for this user",
      });
    }

    const matchPassword = await bcrypt.compare(
      password,
      findUser.dataValues.password
    );

    if (matchPassword) {
      const username = findUser.dataValues.name;
      const token = jwt.sign({ email, username, id: findUser.id }, secret, {
        expiresIn: "1h",
      });

      const user = { email, name: username, id: findUser.id };

      res.cookie("token", token, {
        maxAge: 300000,
        secure: true,
        httpOnly: true,
        sameSite: "none",
      });

      console.log("this is cookie", req.cookies);
      console.log("this is token", token);

      // use n8n webhook to save login
      status = "Success";

      return res.status(200).json({
        message: `Login Successfully!, Welcome ${username}`,
        user,
        token,
      });
    } else {
      return res.status(400).json({ message: "Invalide Email or Password" });
    }
  } catch (err) {
    console.log(err);
    status = "Fail";
    return res.json(err);
  } finally {
    // await historyLogin(email, status);
  }
});

// @==== REGISTER ======
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  let status;
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = { name, email, password: hash };
    const createUser = await Users.create(user);

    console.log(createUser);
    status = "Success";
    return res.status(201).json({
      message: `Register Successfully!, Please Login`,
      data: createUser,
    });
  } catch (err) {

    if (err.name === "SequelizeUniqueConstraintError") {
      console.log("Email already exists") 
      return res.status(409).json({ message: "Email already exists" });
    }
    console.log(err);
    status = "Fail";

    return res.status(500).json({ message: "Server error" });
  } finally {
    // historyRegister(name, email, status);
  }
});

// Swagger Open API
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Server for Software test Final API Documentation",
      version: "1.0.0",
      description:
        "API Documentation for Sign in & Sign up system of Software testing final project",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["index.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 *  components:
 *    schemas:
 *      LoginRequest:
 *        type: object
 *        required:
 *          - email
 *          - password
 *        properties:
 *          email:
 *            type: string
 *            format: email
 *            description: User email
 *          password:
 *            type: string
 *            minLength: 4
 *            description: User password (minimum 4 characters)
 *      LoginResponse:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *          user:
 *            type: object
 *          token:
 *            type: string
 *            description: JWT authentication token
 *        example:
 *          name: Hello
 *          email: hello@mail.com
 *          password: 543221
 *      RegisterRequest:
 *        type: object
 *        required:
 *          - name
 *          - email
 *          - password
 *        properties:
 *          name:
 *            type: string
 *            minLength: 3
 *            maxLength: 30
 *            pattern: '^[a-zA-Z0-9_]+$'
 *            description: Username (letters, numbers, underscores only)
 *          email:
 *            type: string
 *            format: email
 *            description: User email address
 *          password:
 *            type: string
 *            minLength: 6
 *            description: User password (minimum 6 characters)
 *      RegisterResponse:
 *        type: object
 *        properties:
 *          name:
 *            type: string
 *            description: Username (letters, numbers, underscores only)
 *          email:
 *            type: string
 *            format: email
 *            description: User email address
 *          password:
 *            type: string
 *            description: User password (minimum 6 characters)
 *        example:
 *          name: messi
 *          email: leo.messi@mail.com
 *          password: bla_bla
 *      GetUsersResponse:
 *        type: object
 *        properties:
 *          name:
 *            type: string
 *            description: Username (letters, numbers, underscores only)
 *          email:
 *            type: string
 *            description: User email address
 *        example:
 *          name: messi
 *          email: leo.messi@mail.com
 *          password: bla_bla
 *      ValidationError:
 *        type: object
 *        properties:
 *          error:
 *            type: string
 *            description: "Validate user Error"
 *      Error:
 *        type: object
 *        properties:
 *          error:
 *            type: string
 *            example: "Something went wrong"
 */

/**
 * @swagger
 * /api/login:
 *  post:
 *    summary: Login to system
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/LoginRequest'
 *    responses:
 *      200:
 *        description: Sucessful Response
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/LoginResponse'
 *      400:
 *        description: Validation error or user already exists
 *        content:
 *          application/json:
 *            schema:
 *              oneOf:
 *                - $ref: '#/components/schemas/ValidationError'
 *                - $ref: '#/components/schemas/Error'
 *      500:
 *        description: Server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/register:
 *  post:
 *    summary: Register to system
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RegisterRequest'
 *    responses:
 *      201:
 *        description: Sucessful Response
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/RegisterResponse'
 *      400:
 *        description: Validation error or user already exists
 *        content:
 *          application/json:
 *            schema:
 *              oneOf:
 *                - $ref: '#/components/schemas/ValidationError'
 *                - $ref: '#/components/schemas/Error'
 *      500:
 *        description: Server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/users:
 *  get:
 *    summary: Get all users
 *    responses:
 *      200:
 *        description: Sucessful Response
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/GetUsersResponse'
 *      400:
 *        description: Validation error or user already exists
 *        content:
 *          application/json:
 *            schema:
 *              oneOf:
 *                - $ref: '#/components/schemas/ValidationError'
 *                - $ref: '#/components/schemas/Error'
 *      500:
 *        description: Server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */

// RUN
app.listen(PORT, () => {
  console.log(`Server Is Running On Port ${PORT}`);
});
