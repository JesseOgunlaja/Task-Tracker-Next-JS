import styles from "@/styles/page.module.css";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";

const Page = () => {
  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>Organize yourself, and your life.</h1>
        <p className={styles.paragraph}>
          Keep notes and pick up where you left off instantly. Everything all in
          one place.
        </p>
        <p className={styles.signUp}>
          <Link href="/signUp">Sign up for free</Link>
        </p>
      </div>
      <div className={styles.container2}>
        <Image
          className={styles.image}
          width={843.2708688}
          height={450}
          alt="Managing tasks"
          src="/websiteView-min.webp"
          placeholder="blur"
          blurDataURL={
            "data:image/gif;base64,R0lGODlhAQABAPAAACcpOP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
          }
          priority
          loading="eager"
        ></Image>
        <div className={styles.descriptions}>
          <div className={styles.description}>
            <p className={styles.descriptionTitle}>Access from anywhere</p>
            <p className={styles.descriptionText}>
              Easy access from anywhere allows you to get straight back to what
              you were doing instantly.
            </p>
          </div>
          <div className={styles.description}>
            <p className={styles.descriptionTitle}>Remember everything</p>
            <p className={styles.descriptionText}>
              With endless storage, you can store all your info endlessly.
              Making sure that you always remember it.
            </p>
          </div>
          <div className={styles.description}>
            <p className={styles.descriptionTitle}>To do into done</p>
            <p className={styles.descriptionText}>
              By having notes, tasks and schedules all in one place it allows
              you to get tasks done quickly and efficiently.
            </p>
          </div>
        </div>
      </div>
      <br />
      <footer className={styles.footer}>
        <Link href="/terms-and-conditions">Terms</Link>
        <Link href="/privacy-policy">Privacy</Link>
      </footer>
    </>
  );
};

export default Page;
