import ProfileSettings from "@/components/ProfileSettings";
import TaskSettings from "@/components/TaskSettings";
import styles from "@/styles/settings.module.css";
import { headers } from "next/headers";
import Link from "next/link";

const Page = async () => {
  const headerList = headers();
  const url = headerList.get("url");
  const res = await fetch(`${url}/api/user`, {
    headers: {
      cookie: `token=${headerList.get("cookie")}`,
    },
  });
  const data = await res.json();
  const user = data.user;
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
      <div className={styles.container}>
        <ProfileSettings user={user} />
        <TaskSettings user={user} />
      </div>
    </div>
  );
};

export default Page;
