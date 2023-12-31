import styles from "@/styles/why-taskmaster.module.css";
import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Why TaskMaster",
  description:
    "TaskMaster allows you to store your tasks, notes and schedules all in one place. All for free.",
};

const page = () => {
  return (
    <>
      <main className={styles.container}>
        <h3 className={styles.title}>Why choose TaskMaster?</h3>
        <p className={styles.text}>
          TaskMaster allows you to store notes, tasks and schedules all in one
          place. TaskMaster makes it easy to find what you need, whenever. And
          most importantly, for free.
        </p>
        <p className={styles.signUp}>
          <Link href="/signUp">Get started now</Link>
        </p>
        <div className={styles.facts}>
          <div className={styles.fact}>
            <Image
              placeholder="blur"
              blurDataURL="data:image/gif;base64,R0lGODlhAQABAPAAAP+8K////yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
              className={styles.image}
              src="/folder-min.png"
              alt="Folder logo"
              height={64}
              width={80}
            ></Image>
            <p className={styles.factTitle}>Keep it together</p>
            <p className={styles.factText}>
              Store tasks relating to different things in different projects. So
              it&apos;s right there when you need it
            </p>
          </div>
          <div className={styles.fact}>
            <Image
              placeholder="blur"
              blurDataURL="data:image/gif;base64,R0lGODlhAQABAPAAAP/qAP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
              className={styles.image}
              src="/notes-min.jpg"
              alt="File logo"
              height={67.5}
              width={67.5}
            ></Image>
            <p className={styles.factTitle}>Store notes</p>
            <p className={styles.factText}>
              Store notes on your scratchpad so you can get back to where you
              left off immediately.
            </p>
          </div>
          <div className={styles.fact}>
            <Image
              placeholder="blur"
              blurDataURL="data:image/gif;base64,R0lGODlhAQABAPAAAACV5////yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
              className={styles.image}
              src="/world-min.png"
              alt="World logo"
              height={64}
              width={64}
            ></Image>
            <p className={styles.factTitle}>Access anywhere</p>
            <p className={styles.factText}>
              Connect to account from multiple devices, so that you can connect
              no matter where you are.
            </p>
          </div>
          <div className={styles.fact}>
            <Image
              placeholder="blur"
              blurDataURL="data:image/gif;base64,R0lGODlhAQABAPAAAPGUIP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
              className={styles.image}
              src="/brain-min.png"
              alt="Creative logo"
              height={64}
              width={64}
            ></Image>
            <p className={styles.factTitle}>Be creative</p>
            <p className={styles.factText}>
              There&apos;s so much more than just text you can add to your
              notes, such as photos and more.
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default page;
