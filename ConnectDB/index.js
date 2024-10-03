const express = require("express");
const fs = require("fs");
const users = require("./MOCK_DATA.json");
const mongoose = require("mongoose");
const app = express();

const PORT = 4000;

// connection

mongoose
  .connect("mongodb://127.0.0.1:27017/demo-1")
  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log("mongo err", err));

//schema

const userSchema = new mongoose.Schema(
  {
    fristName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    jobTitle: {
      type: String,
    },
    gender: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);
app.use(express.urlencoded({ extended: false }));
app.get("/users", async (req, res) => {
  const allDbUsers = await User.find({});
  const html = `
  <ul>
  ${allDbUsers
    .map((user) => `<li> ${user.fristName} -${user.email}</li>`)
    .join("")}
  </ul>
  `;

  res.send(html);
});

app.get("/api/users", async (req, res) => {
  const allDbUsers = await User.find({});
  return res.json(allDbUsers);
});

app.post("/api/users", async (req, res) => {
  const body = req.body;
  if (
    !body ||
    !body.first_name ||
    !body.last_name ||
    !body.email ||
    !body.gender ||
    !body.job_title
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const result = await User.create({
    fristName: body.first_name,
    lastName: body.last_name,
    email: body.email,
    gender: body.gender,
    jobTitle: body.job_title,
  });
  return res.status(201).json({ msg: "Sucess" });
});

app
  .route("/api/users/:id")
  .get(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(400).json({ msg: "Data not found for this id number" });
    }
    res.send(user);
  })
  .patch(async (req, res) => {
    const userIndex = await User.findByIdAndUpdate(req.params.id);
    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = { ...User[userIndex], ...req.body };
    users[userIndex] = updatedUser;
  })

  .delete(async (req, res) => {
    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({ ststus: "Sucess" });
  });

app.listen(PORT, (error) => {
  if (!error) {
    console.log(`Port is running on ${PORT}`);
  } else {
    console.log(error);
  }
});
