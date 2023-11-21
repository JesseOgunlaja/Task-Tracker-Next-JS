"use client";

import styles from "@/styles/profileSettings.module.css";
import { FormEvent, RefObject, useRef } from "react";
import SettingsPassword from "./SettingsPassword";
import Checkbox from "./Checkbox";
import { emailSchema, passwordSchema, usernameSchema } from "@/utils/zod";
import { errorToast } from "@/utils/toast";
import Link from "next/link";
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";
import GoogleButton from "./GoogleButton";
import { User } from "@/utils/redis";
import ProfileSettingsUsername from "./ProfileSettingsUsername";

const ProfileSettings = ({
  user,
  back,
  dialog,
}: {
  user: User;
  back: string | null;
  dialog: RefObject<HTMLDialogElement>;
}) => {
  const authForm = useRef<HTMLFormElement>(null);
  const passwordForm = useRef<HTMLFormElement>(null);
  const emailForm = useRef<HTMLFormElement>(null);
  const formSessions = useRef<HTMLInputElement>(null);
  const gmailUser = user.password === "GMAIL";

  function showModal() {
    dialog.current!.style.display = "flex";
    dialog.current?.show();
  }

  function hideModal() {
    dialog.current!.style.display = "none";
    dialog.current?.close();
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
        let data: any;
        const fetchRequest = new Promise((resolve, reject) => {
          fetch("/api/settingsChange", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              oldPassword: oldPassword,
              newPassword: newPassword1,
              deleteSessions: formSessions.current?.checked,
            }),
          }).then(async (response: Response) => {
            data = await response.json();
            if (data.message === "Success") {
              resolve(data);
            } else {
              reject(data);
            }
          });
        });
        await toast.promise(fetchRequest, {
          pending: "Loading",
          success: {
            render() {
              passwordForm.current?.reset();
              return "Successfully changed password";
            },
          },
          error: {
            render() {
              if (data.message === "Invalid credentials") {
                return "Invalid credentials";
              } else if (data.message === "Same") {
                return "This is already your password";
              } else {
                return "An error occurred. Please try again";
              }
            },
          },
        });
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
      let data: any;
      const fetchRequest = new Promise((resolve, reject) => {
        fetch("/api/settingsChange", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            createMagicLink: true,
          }),
        }).then(async (response: Response) => {
          data = await response.json();
          if (data.message === "Message sent succesfully") {
            resolve(data);
          } else {
            reject(data);
          }
        });
      });
      await toast.promise(fetchRequest, {
        pending: "Loading",
        success: {
          render() {
            emailForm.current?.reset();
            return `Pending email verification at ${email}`;
          },
        },
        error: {
          render() {
            if (data.message === "Duplicate") {
              return "Email in use";
            } else if (data.message === "Same") {
              return "This is already your email";
            } else {
              return "An error occurred. Please try again";
            }
          },
        },
      });
    }
  }

  async function submitAuth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const checkbox = authForm.current?.firstChild as HTMLLabelElement;
    const input = checkbox.firstChild as HTMLInputElement;

    let data: any;
    const fetchRequest = new Promise((resolve, reject) => {
      fetch("/api/settingsChange", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twoFactorAuth: input.checked,
        }),
      }).then(async (response: Response) => {
        data = await response.json();
        if (data.message === "Success") {
          resolve(data);
        } else {
          reject(data);
        }
      });
    });
    await toast.promise(fetchRequest, {
      pending: "Loading",
      success: "Success",
      error: {
        render() {
          if (data.message === "Same") {
            return "Value has not changed";
          } else {
            return "An error occurred. Please try again";
          }
        },
      },
    });
  }

  async function deleteAccount() {
    const res = await fetch("/api/user", {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.message === "Success") {
      window.location.reload();
    } else {
      errorToast("An error occured please try again");
    }
  }

  async function changeGoogleEmail(credentials: any) {
    let data: any;
    const fetchRequest = new Promise((resolve, reject) => {
      fetch("/api/settingsChange", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          googleCode: credentials,
        }),
      }).then(async (response: Response) => {
        data = await response.json();
        if (data.message === "Success") {
          resolve(data);
        } else {
          reject(data);
        }
      });
    });
    await toast.promise(fetchRequest, {
      pending: "Loading",
      success: "Success",
      error: {
        render() {
          if (data.message === "Same") {
            return "This is already your email";
          } else {
            return "An error occurred. Please try again";
          }
        },
      },
    });
  }

  (
    (dialog.current?.lastChild as HTMLDivElement)
      .firstChild as HTMLButtonElement
  ).onclick = hideModal;

  (
    (dialog.current?.lastChild as HTMLDivElement).lastChild as HTMLButtonElement
  ).onclick = deleteAccount;

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => changeGoogleEmail(codeResponse.access_token),
  });

  return (
    <>
      <div className={styles.container}>
        {user ? (
          <>
            <script
              async
              src="https://kit.fontawesome.com/b9c7cb7078.js"
              crossOrigin="anonymous"
            ></script>
            <h1>Account</h1>
            <Link href={back ? String(back) : "/projects"}>
              <i
                aria-hidden
                style={{ fontSize: "30px" }}
                className="fa-solid fa-arrow-left"
              ></i>
            </Link>
            <br />
            <>
              <ProfileSettingsUsername />

              <br />
              <p>Password</p>
              {gmailUser ? (
                <>
                  <br />
                  <p
                    style={{
                      fontSize: "20px",
                    }}
                  >
                    Password is managed with Google
                  </p>
                  <br />
                  <br />
                </>
              ) : (
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
              )}
              <p>Email</p>

              {gmailUser ? (
                <div style={{ marginBottom: "10px", marginTop: "10px" }}>
                  <GoogleButton text="Change email" googleFunction={login} />
                  <br />
                  <br />
                </div>
              ) : (
                <form
                  ref={emailForm}
                  onSubmit={submitEmail}
                  className={styles.form}
                >
                  <label htmlFor="newEmail">New email</label>
                  <input
                    autoComplete="off"
                    type="email"
                    name="newEmail"
                    id="newEmail"
                  />
                  <input type="submit" />
                </form>
              )}
            </>
            <p>Two Factor authentication</p>
            {gmailUser ? (
              <>
                <br />
                <p style={{ fontSize: "20px" }}>
                  Two Factor Authentication is managed with Google
                </p>
                <br />
                <br />
              </>
            ) : (
              <form
                ref={authForm}
                onSubmit={submitAuth}
                className={styles.form}
              >
                <Checkbox checked={user.settings.twoFactorAuth} />
                <input type="submit" />
              </form>
            )}
            <button onClick={showModal} className={styles.deleteAccount}>
              Delete Account
            </button>
          </>
        ) : (
          <h1>Loading...</h1>
        )}
      </div>
    </>
  );
};

export default ProfileSettings;
