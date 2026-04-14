(() => {
  const form = document.getElementById("loginForm");
  const messageEl = document.getElementById("loginMessage");
  const storageKey = "parkEaseUsers";

  if (!form || !messageEl) {
    return;
  }

  function showMessage(text, type = "error") {
    messageEl.textContent = text;
    messageEl.className = "form-message";
    messageEl.classList.add(type === "success" ? "success" : "error");
  }

  function clearMessage() {
    messageEl.textContent = "";
    messageEl.className = "form-message";
  }

  function getRegisteredUsers() {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.warn("Failed to read registered users from localStorage", error);
      return [];
    }
  }

  function validate(values) {
    const errors = [];

    if (!values.email) {
      errors.push("Email address is required.");
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(values.email)) {
        errors.push("Please enter a valid email address.");
      }
    }

    if (!values.password) {
      errors.push("Password is required.");
    } else if (values.password.length < 6) {
      errors.push("Password must be at least 6 characters.");
    }

    return errors;
  }

  function getRedirectUrl(role) {
    if (role === "Admin") {
      return "adminDashboard.html";
    }

    if (role === "Service Manager") {
      return "managerDashboard.html";
    }

    return "attendantDashboard.html";
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearMessage();

    const values = {
      email: form.email.value.trim().toLowerCase(),
      password: form.password.value,
    };

    const errors = validate(values);
    if (errors.length) {
      showMessage(errors.join(" "), "error");
      return;
    }

    const users = getRegisteredUsers();
    const registeredUser = users.find(
      (user) => user.email && user.email.toLowerCase() === values.email,
    );

    if (!registeredUser) {
      showMessage("No account found for this email. Please register first.", "error");
      return;
    }

    if (registeredUser.password !== values.password) {
      showMessage("Invalid password. Please try again.", "error");
      return;
    }

    localStorage.setItem("parkEaseLoggedIn", "true");
    localStorage.setItem("parkEaseUser", JSON.stringify({
      email: registeredUser.email,
      role: registeredUser.role,
      firstName: registeredUser.firstName,
      surname: registeredUser.surname,
    }));

    showMessage("Login successful! Redirecting...", "success");

    setTimeout(() => {
      window.location.href = getRedirectUrl(registeredUser.role);
    }, 800);
  });
})();
