import styles from "@/styles/features.module.css";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Features",
  description: "The great and amazing features of TaskMaster",
};

const keyStr =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

const triplet = (e1: number, e2: number, e3: number) =>
  keyStr.charAt(e1 >> 2) +
  keyStr.charAt(((e1 & 3) << 4) | (e2 >> 4)) +
  keyStr.charAt(((e2 & 15) << 2) | (e3 >> 6)) +
  keyStr.charAt(e3 & 63);

const rgbDataURL = (r: number, g: number, b: number) =>
  `data:image/gif;base64,R0lGODlhAQABAPAA${
    triplet(0, r, g) + triplet(b, 255, 255)
  }/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`;

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
              blurDataURL={rgbDataURL(84, 84, 84)}
              src="/teamTasks.webp"
              width={600}
              height={450}
              alt="Finishing task picture"
              className={styles.image}
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
              blurDataURL={rgbDataURL(255, 255, 255)}
              src="/finishingTask.jpg"
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
