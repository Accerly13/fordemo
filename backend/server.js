const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  code: String,
  number5: { type: String, required: false },
});

const User = mongoose.model("User", userSchema);

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
function shuffleString(str) {
  return str.split("").sort(() => 0.5 - Math.random()).join("");
}

app.get("/", (req, res) => {
  res.send("This URL is for backend setup only. Create new data with the parameter username (your surname) and a password (not real password) with /users as an endpoint to get the answer in number 1. The answer format is ITMC{answer}.");
});

app.post("/users", async (req, res) => {
  const { username, password } = req.body;
  const code = generateCode();
  const user = new User({ username, password, code });
  await user.save();
  res.json({
    message: `ITMC{${code}}. To proceed to number 2, fetch the data from the endpoint extended with the 6 random characters.`,
    code,
    id: user._id,
  });
});



app.get("/users/:code", async (req, res) => {
  const { code } = req.params;
  const user = await User.findOne({ code });
  if (!user) return res.status(404).json({ error: "Invalid code" });
  res.json({
    message: `ITMC{${shuffleString(user.username)}}. Now update your username using the ??? method to get the answer to number 3. Replace the 6 random characters in the endpoint with the id.`,
    id: user._id,
  });
});

app.patch("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  const user = await User.findByIdAndUpdate(id);
  user.username = username;
  user.save();
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({
    message: `ITMC{${user.username}}. Then fetch all users data.`,
  });
});

app.get("/users", async (req, res) => {
  const users = await User.find().select("-password");
  res.json({
    message: "ITMC{Well done! 🙄}. Now delete your user with the endpoint ended with your 6 random characters.",
    users,
  });
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  const code1 = generateCode();
  const code2 = generateCode();
  user.number5 = code1 + code2;
  user.save();
  if (!user) return res.status(404).json({ error: "User not found" });
  res.status(403).json({
    message: `Cannot delete due to API permission. ITMC{${code1}${code2}}`
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Sumakses!`);
});
