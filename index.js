import express from "express";
import { sequelize } from "./config/database.js";
import { Users } from "./model/user.js";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
const PORT = 3000;

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
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

app.post("api/login", async (req, res) => {
  const user = req.body;
  const email = user.email;

  console.log(email);

  try {
    const findUser = await Users.findOne({
      where: { email: email },
    });

    const username = findUser.dataValues.name;

    res.status(200).json({
      message: `Login Successfully!, Welcome ${username}`,
      data: {id: findUser.id, name: findUser.name, email: findUser.email},
    });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

app.post("api/register", async (req, res) => {
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
 * /:
 *  get:
 *    summary: Say Hello to user
 *    response:
 *      200:
 *        description: Sucessful Response
 *        content:
 *          text/plain:
 *            schema:
 *              type: string
 *              example:
 *                Helloworld
 */

// RUN
app.listen(PORT, () => {
  console.log(`Server Is Running On Port ${PORT}`);
});
