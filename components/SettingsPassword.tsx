import { useState } from "react";
import styles from "@/styles/settingsPassword.module.css";

const SettingsPassword = (props: any) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  function togglePasswordVisibility() {
    setIsPasswordVisible((prevState) => !prevState);
  }

  return (
    <div className={styles.button}>
      <input
        placeholder="Password"
        className={styles.input}
        name={props.name}
        id={props.name}
        autoComplete="off"
        type={isPasswordVisible ? "text" : "password"}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className={styles.show}
      >
        {isPasswordVisible ? "Hide" : "Show"}
      </button>
    </div>
  );
};

export default SettingsPassword;
