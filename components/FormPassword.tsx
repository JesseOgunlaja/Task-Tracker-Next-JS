import { CSSProperties, useState } from "react";
import styles from "@/styles/formPassword.module.css";

const FormPassword = (props: { style?: CSSProperties }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  function togglePasswordVisibility() {
    setIsPasswordVisible((prevState) => !prevState);
  }

  return (
    <div style={props.style} className={styles.button}>
      <input
        placeholder="Password"
        className={styles.input}
        name="password"
        id="password"
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

export default FormPassword;
