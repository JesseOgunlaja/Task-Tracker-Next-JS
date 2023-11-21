import { showToast } from "@/utils/toast";
import { usernameSchema } from "@/utils/zod";
import { FormEvent, useRef } from "react";
import { toast } from "react-toastify";
import styles from "@/styles/profileSettings.module.css";

const ProfileSettingsUsername = () => {
  const usernameForm = useRef<HTMLFormElement>(null);

  async function submitUsername(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    const username = formValues.newName;
    const result = usernameSchema.safeParse(username);
    if (!result.success) {
      showToast(result.error.format()._errors[0], "error");
    } else {
      let data: any;
      const fetchRequest = new Promise((resolve, reject) => {
        fetch("/api/settingsChange", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: username,
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
            usernameForm.current?.reset();
            return "Successfully changed username";
          },
        },
        error: {
          render() {
            if (data.message === "Duplicate") {
              return "Username in use";
            } else if (data.message === "Same") {
              return "This is already your username";
            } else {
              return "An error occurred. Please try again";
            }
          },
        },
      });
    }
  }

  return (
    <div>
      <p>Username</p>
      <form
        ref={usernameForm}
        onSubmit={submitUsername}
        className={styles.form}
      >
        <label htmlFor="newName">New username</label>
        <input autoComplete="off" type="text" id="newName" name="newName" />
        <input type="submit" />
      </form>
    </div>
  );
};

export default ProfileSettingsUsername;
