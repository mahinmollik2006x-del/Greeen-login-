const page = document.getElementById("page");
const cube = document.getElementById("authCube");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const loginNotice = document.getElementById("loginNotice");
const signupNotice = document.getElementById("signupNotice");
const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const confirmPassword = signupForm.elements.confirmPassword;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function setMotion(x, y) {
  const bounds = page.getBoundingClientRect();
  const horizontal = Math.max(-0.5, Math.min(0.5, (x - bounds.left) / bounds.width - 0.5));
  const vertical = Math.max(-0.5, Math.min(0.5, (y - bounds.top) / bounds.height - 0.5));
  page.style.setProperty("--tilt-x", `${-vertical * 5}deg`);
  page.style.setProperty("--tilt-y", `${horizontal * 6}deg`);
  page.style.setProperty("--card-tilt-x", `${-vertical * 2}deg`);
  page.style.setProperty("--card-tilt-y", `${horizontal * 3}deg`);
  page.style.setProperty("--glow-x", `${-horizontal * 30}px`);
  page.style.setProperty("--glow-y", `${-vertical * 24}px`);
  page.style.setProperty("--intro-x", `${-horizontal * 10}px`);
  page.style.setProperty("--intro-y", `${-vertical * 8}px`);
}

function resetMotion() {
  [
    "--tilt-x", "--tilt-y", "--card-tilt-x", "--card-tilt-y",
    "--glow-x", "--glow-y", "--intro-x", "--intro-y"
  ].forEach((property) => page.style.setProperty(property, ""));
}

page.addEventListener("pointermove", (event) => {
  if (!reducedMotion.matches) setMotion(event.clientX, event.clientY);
});
page.addEventListener("pointerleave", resetMotion);
page.addEventListener("pointerup", (event) => {
  if (event.pointerType === "touch") window.setTimeout(resetMotion, 350);
});

togglePassword.addEventListener("click", () => {
  const visible = password.type === "password";
  password.type = visible ? "text" : "password";
  togglePassword.textContent = visible ? "HIDE" : "SHOW";
  togglePassword.setAttribute("aria-label", visible ? "Hide password" : "Show password");
  togglePassword.setAttribute("aria-pressed", String(visible));
  password.focus();
});

function setNotice(element, message, isError) {
  element.textContent = message;
  element.classList.toggle("error", isError);
}

function switchPanel(target) {
  const showSignup = target === "signup";
  cube.classList.toggle("is-signup", showSignup);
  loginForm.inert = showSignup;
  signupForm.inert = !showSignup;
  loginForm.setAttribute("aria-hidden", String(showSignup));
  signupForm.setAttribute("aria-hidden", String(!showSignup));
  history.replaceState(null, "", showSignup ? "#signup" : "#login");

  const activeForm = showSignup ? signupForm : loginForm;
  const firstInput = activeForm.querySelector("input");
  if (firstInput) firstInput.focus({ preventScroll: true });
}

document.querySelectorAll("[data-switch]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    switchPanel(link.dataset.switch);
  });
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!loginForm.reportValidity()) return;
  setNotice(loginNotice, "Looks good! Connect a backend to finish signing in.", false);
});

function validatePasswordMatch() {
  confirmPassword.setCustomValidity(
    confirmPassword.value && confirmPassword.value !== signupForm.elements.password.value
      ? "Your passwords do not match."
      : ""
  );
}

signupForm.elements.password.addEventListener("input", validatePasswordMatch);
confirmPassword.addEventListener("input", validatePasswordMatch);

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  validatePasswordMatch();
  if (!signupForm.reportValidity()) return;
  setNotice(signupNotice, "You're all set! Connect a backend to create your account.", false);
});

document.querySelectorAll("[data-message]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const notice = cube.classList.contains("is-signup") ? signupNotice : loginNotice;
    setNotice(notice, link.dataset.message, true);
  });
});

document.querySelectorAll("[data-provider]").forEach((button) => {
  button.addEventListener("click", () => {
    setNotice(loginNotice, `${button.dataset.provider} sign-in needs OAuth/backend setup.`, true);
  });
});

if (window.location.hash === "#signup") switchPanel("signup");
