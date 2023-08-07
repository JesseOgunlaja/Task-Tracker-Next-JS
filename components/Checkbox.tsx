import styles from "@/styles/checkbox.module.css";
import { useState } from "react";
const Checkbox = ({ checked }: any) => {
  const [checkValue, setCheckValue] = useState<boolean>(checked);

  return (
    <>
      <label className={styles.switch} htmlFor="checkbox">
        <input
          checked={checkValue}
          onChange={(e) => setCheckValue(e.target.checked)}
          type="checkbox"
          className={styles.input}
          id="checkbox"
        />
        <div className={`${styles.round} ${styles.slider}`}></div>
      </label>
    </>
  );
};

export default Checkbox;
