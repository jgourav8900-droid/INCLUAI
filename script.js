
const form = document.querySelector("#chat-form");
const input = document.querySelector("#message");
const chat = document.querySelector("#chat");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const message = input.value.trim();
  if (!message) return;

  const userMessage = document.createElement("p");
  userMessage.className = "user";
  userMessage.textContent = message;
  chat.appendChild(userMessage);

  const reply = document.createElement("p");
  reply.className = "bot";
  reply.textContent =
    "This is a demo response. In the next phase, " +
    "we will connect a real AI model to INCLUAI.";

  chat.appendChild(reply);

  input.value = "";
  chat.scrollTop = chat.scrollHeight;
});

document.querySelectorAll(".nav").forEach(function (button) {
  button.addEventListener("click", function () {
    document.querySelectorAll(".nav").forEach(function (item) {
      item.classList.remove("active");
    });

    button.classList.add("active");

    document.querySelector("#page-title").textContent =
      button.dataset.page;
  });
});