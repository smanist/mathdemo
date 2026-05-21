(function () {
  "use strict";

  const CREDENTIALS = {
    account: "course",
    passcode: "notes",
  };
  const SESSION_KEY = "courseLandingUnlocked";

  function storageGet(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (_error) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (_error) {
      // The landing gate still works for the current page if storage is blocked.
    }
  }

  function setLocked() {
    document.documentElement.classList.add("course-landing--locked");
    document.documentElement.classList.remove("course-landing--unlocked");
  }

  function setUnlocked() {
    document.documentElement.classList.remove("course-landing--locked");
    document.documentElement.classList.add("course-landing--unlocked");
  }

  function makeField({ id, label, type, autocomplete }) {
    const wrapper = document.createElement("div");
    const labelElement = document.createElement("label");
    const input = document.createElement("input");

    wrapper.className = "course-landing-auth__field";
    labelElement.htmlFor = id;
    labelElement.textContent = label;
    input.id = id;
    input.name = id;
    input.type = type;
    input.autocomplete = autocomplete;
    input.required = true;

    wrapper.append(labelElement, input);
    return { wrapper, input };
  }

  function initLandingGate() {
    const gate = document.querySelector(".course-landing-auth");

    if (!gate) {
      return;
    }

    if (storageGet(SESSION_KEY) === "true") {
      setUnlocked();
      return;
    }

    setLocked();

    const title = document.createElement("p");
    const summary = document.createElement("p");
    const form = document.createElement("form");
    const account = makeField({
      id: "course-landing-account",
      label: "Account",
      type: "text",
      autocomplete: "username",
    });
    const passcode = makeField({
      id: "course-landing-passcode",
      label: "Passcode",
      type: "password",
      autocomplete: "current-password",
    });
    const button = document.createElement("button");
    const message = document.createElement("div");

    title.className = "course-landing-auth__title";
    title.textContent = "Course Access";
    summary.className = "course-landing-auth__summary";
    summary.textContent = "Enter your account and passcode.";
    form.className = "course-landing-auth__form";
    button.className = "course-landing-auth__button";
    button.type = "submit";
    button.textContent = "Continue";
    message.className = "course-landing-auth__message";
    message.setAttribute("role", "alert");

    form.append(account.wrapper, passcode.wrapper, button, message);
    gate.replaceChildren(title, summary, form);

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const accountValue = account.input.value.trim();
      const passcodeValue = passcode.input.value;
      const isValid =
        accountValue === CREDENTIALS.account && passcodeValue === CREDENTIALS.passcode;

      if (!isValid) {
        message.textContent = "The account and passcode do not match.";
        passcode.input.value = "";
        passcode.input.focus();
        return;
      }

      storageSet(SESSION_KEY, "true");
      setUnlocked();
    });
  }

  document.addEventListener("DOMContentLoaded", initLandingGate);
})();
