import { useState } from "react";
import styles from "@/styles/settingsPassword.module.css";

const SettingsPassword = (props: { name: string }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  function togglePasswordVisibility() {
    setIsPasswordVisible((prevState) => !prevState);
  }

  return (
    <div className={styles.button}>
      <input
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
