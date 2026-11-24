document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("contact-form");
const statusEl = document.getElementById("contact-status");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setStatus(text, kind) {
  statusEl.textContent = text;
  statusEl.className = "status" + (kind ? " " + kind : "");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));

  // Bots tick the hidden checkbox; drop those submissions silently.
  if (data.botcheck) return;

  if (!data.name.trim() || !data.email.trim() || !data.message.trim()) {
    return setStatus("Please fill in your name, email, and message.", "err");
  }
  if (!EMAIL_RE.test(data.email.trim())) {
    return setStatus("Please enter a valid email address.", "err");
  }

  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  setStatus("Sending…");

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json().catch(() => ({}));
    if (res.ok && result.success) {
      form.reset();
      setStatus("Thanks, your message was sent. I'll reply by email.", "ok");
    } else if (res.status === 429) {
      setStatus("Too many requests right now. Please try again in a minute.", "err");
    } else {
      setStatus("Something went wrong. Please try again later.", "err");
    }
  } catch {
    setStatus("Could not reach the server. Please try again later.", "err");
  } finally {
    button.disabled = false;
  }
});
