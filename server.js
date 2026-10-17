
// ========================================
// 1. IMPORT PACKAGES
// ========================================

const express = require("express");
const cors = require("cors");


// ========================================
// 2. INITIALIZE SERVER
// ========================================

const app = express();
const PORT = 3000;


// ========================================
// 3. MIDDLEWARE
// ========================================

// Allow requests from your Live Server frontend.
app.use(cors());

// Parse JSON request bodies.
app.use(express.json());


// ========================================
// 4. TEST BACKEND CONNECTION
// ========================================

app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        message: "Downly backend is running!"
    });
});


// ========================================
// 5. RECEIVE AND VALIDATE MEDIA URL
// ========================================

app.post("/api/download", (req, res) => {
    const { url } = req.body;

    // Check whether a URL was provided.
    if (!url || typeof url !== "string") {
        return res.status(400).json({
            success: false,
            message: "Please provide a media URL."
        });
    }

    let parsedUrl;

    // Validate URL format.
    try {
        parsedUrl = new URL(url);
    } catch {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid URL."
        });
    }

    // Allow only HTTP and HTTPS.
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return res.status(400).json({
            success: false,
            message: "Only HTTP and HTTPS URLs are supported."
        });
    }

    // Respond with the validated URL.
    res.json({
        success: true,
        message: "The URL was received successfully.",
        url: parsedUrl.href
    });
});


// ========================================
// 6. HANDLE UNKNOWN API ROUTES
// ========================================

app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found."
    });
});


// ========================================
// 7. START SERVER
// ========================================

app.listen(PORT, () => {
    console.log(
        `Downly backend running at http://localhost:${PORT}`
    );
});

