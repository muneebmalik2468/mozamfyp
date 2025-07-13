const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
// const bodyParser = require("body-parser")
const app = express();
const Routes = require("./routes/route.js");

const PORT = process.env.PORT || 5000;

dotenv.config();

// app.use(bodyParser.json({ limit: '10mb', extended: true }))
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

app.use(express.json({ limit: "10mb" }));
// app.use(cors());
// app.use(cors({
//   origin: 'https://mozamfyp-backend.vercel.app',
//   credentials: true
// }));
app.use(cors({
  origin: 'https://mozamfyp-frontend.vercel.app', // your actual frontend domain
  credentials: true
}));

// mongoose
//   .connect(process.env.MONGO_URL)
//   .then(console.log("Connected to MongoDB"))
//   .catch((err) => console.log("NOT CONNECTED TO NETWORK", err));

mongoose
  .connect("mongodb+srv://finalyearproject596:finalyearproject596@cluster0.5dxe1ee.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0")
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log("NOT CONNECTED TO NETWORK", err));


app.use("/", Routes);

app.get('/', (req, res) => {
  res.send("all ok")
})

app.listen(PORT, () => {
  console.log(`Server started at port no. ${PORT}`);
});
