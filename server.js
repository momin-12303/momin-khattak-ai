const express = require("express");
const cors = require("cors");
const path = require("path");

const chatRoutes = require("./routes/chat");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/chat", chatRoutes);

// Serve the main page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Momin Khattak AI server running on port ${PORT}`);
    console.log(
        `Access your AI at: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`,
    );
});
