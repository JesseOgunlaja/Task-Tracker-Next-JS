"use client";

import styles from "@/styles/profileSettings.module.css";
import { FormEvent, useRef } from "react";
import SettingsPassword from "./SettingsPassword";
import Checkbox from "./Checkbox";
import { emailSchema, passwordSchema, usernameSchema } from "@/utils/zod";
import { errorToast, successToast } from "@/utils/toast";

const ProfileSettings = ({ user }: any) => {
  const authForm = useRef<HTMLFormElement>(null);
  const passwordForm = useRef<HTMLFormElement>(null);
  const usernameForm = useRef<HTMLFormElement>(null);
  const emailForm = useRef<HTMLFormElement>(null);
  const formSessions = useRef<HTMLInputElement>(null);

  async function submitUsername(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    const username = formValues.newName;
    const result = usernameSchema.safeParse(username);
    if (!result.success) {
      errorToast(result.error.format()._errors[0]);
    } else {
      const res = await fetch("/api/settingsChange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: username,
        }),
      });
      const data = await res.json();
      if (data.message === "Success") {
        usernameForm.current?.reset();
        successToast("Success");
      }
      if (data.message === "Duplicate") {
        errorToast("Username in use");
      }
      if (data.message === "Same") {
        errorToast("This is already your username");
      }
    }
  }

  async function submitNewPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    const oldPassword = formValues.oldPassword;
    const newPassword1 = formValues.newPassword1;
    const newPassword2 = formValues.newPassword2;
    if (newPassword1 !== newPassword2) {
      errorToast("Passwords don't match");
    } else {
      const result = passwordSchema.safeParse(newPassword1);
      if (!result.success) {
        errorToast(result.error.format()._errors[0]);
      } else {
        const res = await fetch("/api/settingsChange", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oldPassword: oldPassword,
            newPassword: newPassword1,
            keepSessions: formSessions.current?.checked,
          }),
        });
        const data = await res.json();
        if (data.message === "Invalid credentials") {
          errorToast("Invalid credentials");
        }
        if (data.message === "Success") {
          passwordForm.current?.reset();
          successToast("Success");
        }
        if (data.message === "Same") {
          errorToast("This is already your password");
        }
      }
    }
  }

  async function submitEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    const email = formValues.newEmail;
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      errorToast(result.error.format()._errors[0]);
    } else {
      const res = await fetch("/api/settingsChange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });
      const data = await res.json();
      if (data.message === "Success") {
        emailForm.current?.reset();
        successToast("Success");
      }
      if (data.message === "Duplicate") {
        errorToast("Email in use");
      }
      if (data.message === "Same") {
        errorToast("This is already your email");
      }
    }
  }

  async function submitAuth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const checkbox = authForm.current?.firstChild as HTMLLabelElement;
    const input = checkbox.firstChild as HTMLInputElement;
      const res = await fetch("/api/settingsChange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twoFactorAuth: input.checked,
        }),
      });
      const data = await res.json();
      if (data.message === "Success") {
        successToast("Success");
      }
      if (data.message === "Same") {
        errorToast("Value has not changed");
      }
  }

  return (
    <div className={styles.container}>
      {user ? (
        <>
          <h1>Account</h1>
          <br />
          <p>Change username</p>
          <form
            ref={usernameForm}
            onSubmit={submitUsername}
            className={styles.form}
          >
            <label htmlFor="newName">New username</label>
            <input autoComplete="off" type="text" id="newName" name="newName" />
            <input type="submit" />
          </form>
          <p>Reset password</p>
          <form
            onSubmit={submitNewPassword}
            ref={passwordForm}
            className={styles.form}
          >
            <label htmlFor="oldPassword">Old password</label>
            <SettingsPassword name="oldPassword" />
            <label htmlFor="newPassword1">New password</label>
            <SettingsPassword name="newPassword1" />
            <label htmlFor="newPassword2">Confirm new password</label>
            <SettingsPassword name="newPassword2" />
            <div>
              <label htmlFor="sessions">Log out all sessions</label>
              <input
                type="checkbox"
                ref={formSessions}
                id="sessions"
                name="sessions"
              />
            </div>
            <input type="submit" />
          </form>
          <p>Change email</p>
          <form ref={emailForm} onSubmit={submitEmail} className={styles.form}>
            <label htmlFor="newEmail">New email</label>
            <input
              autoComplete="off"
              type="email"
              name="newEmail"
              id="newEmail"
            />
            <input type="submit" />
          </form>
          <p>Two Factor authentication</p>
          <form ref={authForm} onSubmit={submitAuth} className={styles.form}>
            <Checkbox checked={user.settings.twoFactorAuth} />
            <input type="submit" />
          </form>
        </>
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
};

export default ProfileSettings;
