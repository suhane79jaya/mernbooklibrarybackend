import express from "express";
import { mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import booksRoute from "./routes/booksRoute.js";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { UserModel } from "./models/User.js";

const app = express();

// Middleware for parsing request body
app.use(express.json());

app.use(
  cors({
    Origin: ["http://localhost:5173/"],
    Methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/", cors(), (request, response) => {
  console.log(request);
  return response.status(234).send("Welcome To MERN Stack Tutorial");
});

app.use("/books", cors(), booksRoute);
const varifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json("Token is missing");
  } else {
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
      if (err) {
        return res.json("Error with token");
      } else {
        if (decoded.role === "admin") {
          next();
        } else {
          return res.json("not admin");
        }
      }
    });
  }
};

app.get("/dashboard", cors(), varifyUser, (req, res) => {
  res.json("Success");
});
app.post("/register", cors(), (req, res) => {
  const { name, email, password } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      UserModel.create({ name, email, password: hash })
        .then((user) => res.json("Sucess"))
        .catch((err) => res.json(err));
    })
    .catch((err) => res.json(err));
});

app.post("/login", cors(), (req, res) => {
  const { email, password } = req.body;
  UserModel.findOne({ email: email }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password, (err, response) => {
        if (response) {
          const token = jwt.sign(
            { email: user.email, role: user.role },
            "jwt-secret-key",
            { expiresIn: "1d" }
          );

          res.cookie("token", token);
          return res.json({ status: "Success", role: user.role, token: token });
        } else {
          return response.json("The password is incorrect");
        }
      });
    } else {
      return res.json("No record existed");
    }
  });
});

app.get("/logout", (res, req) => {
  console.log("Hello my logout page");
  res.clearCookie("token", { path: "/" });
  res.status(200).send("User logout");
});
//step2 of deployment
const PORT = process.env.PORT || 5000;
//step 3 of deployment
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static("frontend/build"));
// }
mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.log("App connected to database");
    app.listen(PORT, () => {
      console.log(`App is listening to port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
