import ProfileSettings from "@/components/ProfileSettings";
import styles from "@/styles/settings.module.css";
import Link from "next/link";

const Page = () => {
  return (
    <div className={styles.page}>
      <title>Settings</title>
      <ul className={styles.sideNav}>
        <li>Account</li>
        <li>App settings</li>
        <li>Something</li>
        <li>Something</li>
        <li>Something</li>
        <li>Something</li>
        <li>Something</li>
        <li>Something</li>
        <button>
          <Link href="/dashboard">Back</Link>
        </button>
      </ul>
      <ProfileSettings />
    </div>
  );
};

export default Page;
