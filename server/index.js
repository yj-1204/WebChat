const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoute = require("./Routes/userRoute");
const chatRoute = require("./Routes/chatRoute")
const messagesRoute = require("./Routes/messageRoute")

const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI;

app.use(express.json());
app.use(cors()); // CORS middleware should be before routes
app.use('/api/users', userRoute);
app.use('/api/chats',chatRoute);
app.use('/api/messages',messagesRoute);

app.get("/", (req, res) => {
    res.send("Welcome to our chat app APIs...");
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("MongoDB is connected!!");
}).catch((error) => {
    console.log("MongoDB connection failed: ", error.message);
});
