import styles from "@/styles/features.module.css";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Features",
  description: "The great and amazing features of TaskMaster",
};

const page = () => {
  return (
    <>
      <main className={styles.container}>
        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.description}>
              <h2 className={styles.featureTitle}>
                Collaborate in teams to get tasks done quickly
              </h2>
              <p className={styles.featureDescription}>
                Teams allow you to share tasks with a group of people. With
                teams you can make your account as normal and then create a team
                where you can invite others to join.
              </p>
            </div>
            <Image
              placeholder="blur"
              blurDataURL="data:image/gif;base64,R0lGODlhAQABAPAAAFRUVP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
              src="/teamTasks-min.jpg"
              width={600}
              height={450}
              alt="Finishing task picture"
              className={styles.image}
              priority
              loading="eager"
            ></Image>
          </div>
          <div className={styles.feature}>
            <div className={styles.description}>
              <h2 className={styles.featureTitle}>
                Tasks: An easy way to turn to-do to done.
              </h2>
              <p className={styles.featureDescription}>
                Tasks allow you to keep hold of everything you need to do. You
                can even add due dates and reminders to them to help you stay on
                top of it. With tasks you always know what to do and when to do
                it.
              </p>
            </div>
            <Image
              placeholder="blur"
              blurDataURL="data:image/gif;base64,R0lGODlhAQABAPAAAP///////yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
              src="/finishingTask-min.jpg"
              width={600}
              height={380}
              alt="Finishing task picture"
              className={styles.image}
            ></Image>
          </div>
        </div>
      </main>
    </>
  );
};

export default page;
