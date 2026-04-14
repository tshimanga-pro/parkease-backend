      (function () {
        const storageKey = "parkEaseUsers";
        const form = document.getElementById("loginForm");
        const messageEl = document.getElementById("formMessage");

        if (!form || !messageEl) {
          return;
        }

        function showMessage(text, type = "success") {
          messageEl.textContent = text;
          messageEl.className = "form-message";
          messageEl.classList.add(type === "error" ? "error" : "success");
        }

        function clearMessage() {
          messageEl.textContent = "";
          messageEl.className = "form-message";
        }

        function getUsers() {
          try {
            const raw = localStorage.getItem(storageKey);
            return raw ? JSON.parse(raw) : [];
          } catch (error) {
            console.warn("Unable to read saved users:", error);
            return [];
          }
        }

        function saveUsers(users) {
          localStorage.setItem(storageKey, JSON.stringify(users));
        }

        function isValidEmail(value) {
          return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
        }

        function validateUser(values) {
          const errors = [];

          if (!values.firstName || values.firstName.trim().length < 2) {
            errors.push("First name must have at least 2 characters.");
          }

          if (!values.surname || values.surname.trim().length < 2) {
            errors.push("Surname must have at least 2 characters.");
          }

          if (!values.email || !isValidEmail(values.email)) {
            errors.push("A valid email address is required.");
          }

          if (!values.password || values.password.length < 6) {
            errors.push("Password must be at least 6 characters long.");
          }

          if (!values.telephone || !/^\+?\d{7,15}$/.test(values.telephone.trim())) {
            errors.push("Telephone is required and must contain only digits.");
          }

          if (!values.role) {
            errors.push("Role is required.");
          }

          return errors;
        }

        function resetForm() {
          form.reset();
          clearMessage();
        }

        form.addEventListener("submit", function (event) {
          event.preventDefault();
          clearMessage();

          const user = {
            firstName: form.firstName.value.trim(),
            surname: form.surname.value.trim(),
            email: form.email.value.trim(),
            password: form.password.value,
            telephone: form.telephone.value.trim(),
            role: form.role.value,
            createdAt: new Date().toISOString(),
          };

          const errors = validateUser(user);
          const savedUsers = getUsers();

          if (savedUsers.some((entry) => entry.email.toLowerCase() === user.email.toLowerCase())) {
            errors.push("This email address is already registered.");
          }

          if (savedUsers.some((entry) => entry.password === user.password)) {
            errors.push("This password is already in use. Please choose a unique password.");
          }

          if (errors.length) {
            showMessage(errors.join(" "), "error");
            return;
          }

          savedUsers.push(user);
          saveUsers(savedUsers);
          alert("Registration saved to local storage.");
          resetForm();
        });
      })();
