
// ========================================
// 1. SELECT HTML ELEMENTS
// ========================================

const downloadForm = document.getElementById("download-form");
const mediaUrl = document.getElementById("media-url");
const pasteButton = document.getElementById("paste-button");
const formMessage = document.getElementById("form-message");

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const currentYear = document.getElementById("current-year");


// ========================================
// 2. UPDATE FOOTER YEAR
// ========================================

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}


// ========================================
// 3. MOBILE NAVIGATION
// ========================================

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.textContent = isOpen ? "✕" : "☰";
    });

    // Close navigation after clicking a link.
    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.textContent = "☰";
        });
    });
}


// ========================================
// 4. DISPLAY STATUS MESSAGES
// ========================================

function showMessage(message, type = "") {
    if (!formMessage) return;

    formMessage.textContent = message;
    formMessage.className = "form-message";

    if (type) {
        formMessage.classList.add(type);
    }
}


// ========================================
// 5. PASTE URL FROM CLIPBOARD
// ========================================

if (pasteButton && mediaUrl) {
    pasteButton.addEventListener("click", async () => {
        try {
            if (!navigator.clipboard) {
                throw new Error("Clipboard unavailable");
            }

            const clipboardText = await navigator.clipboard.readText();

            if (!clipboardText.trim()) {
                showMessage("Your clipboard is empty.", "error");
                return;
            }

            mediaUrl.value = clipboardText.trim();

            showMessage(
                "Link pasted. Click Download to continue.",
                "success"
            );

        } catch (error) {
            showMessage(
                "Clipboard access is unavailable. Please paste your link manually.",
                "error"
            );

            mediaUrl.focus();
        }
    });
}


// ========================================
// 6. VALIDATE URL
// ========================================

function validateMediaUrl(value) {
    let parsedUrl;

    try {
        parsedUrl = new URL(value);
    } catch {
        throw new Error("Please enter a valid URL.");
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Only HTTP and HTTPS links are supported.");
    }

    return parsedUrl;
}



// ========================================
// 7. DOWNLOAD MEDIA THROUGH THE BACKEND
// ========================================

if (downloadForm && mediaUrl) {
    downloadForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const urlValue = mediaUrl.value.trim();

        if (!urlValue) {
            showMessage("Please enter a media URL.", "error");
            return;
        }

        try {
            validateMediaUrl(urlValue);
        } catch (error) {
            showMessage(error.message, "error");
            return;
        }

        showMessage("Preparing your download...", "success");

        try {
            const response = await fetch(
                "http://localhost:3000/api/download",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        url: urlValue
                    })
                }
            );

            // The backend returns JSON when an error occurs.
            if (!response.ok) {
                const errorData = await response.json();

                throw new Error(
                    errorData.message || "Download failed."
                );
            }

            // Receive the actual media file.
            const blob = await response.blob();

            // Read the filename from the response headers.
            const disposition = response.headers.get(
                "Content-Disposition"
            );

            let filename = "downly-download";

            if (disposition) {
                const match = disposition.match(
                    /filename="([^"]+)"/
                );

                if (match) {
                    filename = match[1];
                }
            }

            // Trigger the browser download.
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = objectUrl;
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => {
                URL.revokeObjectURL(objectUrl);
            }, 1000);

            showMessage(
                "Download started successfully!",
                "success"
            );

        } catch (error) {
            console.error("Download error:", error);

            showMessage(
                error.message ||
                "Download failed. Check your backend connection.",
                "error"
            );
        }
    });
}
