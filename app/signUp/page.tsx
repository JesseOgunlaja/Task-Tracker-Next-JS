import SignUpForm from "@/components/SignUpForm";
import styles from "@/styles/signingUp.module.css";
import { encryptString } from "@/utils/encryptString";

const Page = () => {
  return (
    <>
      <title>Sign up</title>
      <div className={styles.page}>
        <div className={styles.container}>
          <h1>Sign up</h1>
          <br />
          <SignUpForm />
        </div>
      </div>
    </>
  );
};

export default Page;
