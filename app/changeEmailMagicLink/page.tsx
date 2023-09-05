import styles from "@/styles/magicLink.module.css";
import Link from "next/link";

type Props = {
  params: {};
  searchParams: { [key: string]: string | string[] | undefined };
};

const Page = async (props: Props) => {
  if (process.env.NODE_ENV === "production") {
    var domain = "https://taskmasterapp.com";
  } else {
    var domain = "http://localhost:3000";
  }
  const params = props.searchParams;

  const email = decodeURI(String(params.email));
  const code = decodeURI(String(params.code));

  const res = await fetch(`${domain}/api/settingsChange`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      cache: "no-store",
    },
    next: {
      revalidate: 0,
    },
    body: JSON.stringify({
      email: params.email == undefined ? null : email,
      code: params.code == undefined ? null : code,
      createMagicLink: false,
    }),
  });

  const data = await res.json();

  console.log(data);

  return (
    <div className={styles.page}>
      {data.message === "Success" && (
        <main className={styles.container}>
          <p>Email successfully changed</p>
          <div>
            <p>From: {data.oldEmail}</p>
            <p>To: {email}</p>
          </div>
          <Link href="/">Go back to home page</Link>
        </main>
      )}
      {data.message === "Code expired" &&
        code != undefined &&
        email != undefined && (
          <main className={styles.container2}>
            <p>Code not found</p>
            <p>
              We couldn&apos;t find the code in our database
              <br />
              <br />
              This could have happened because your code has been used already
              or has expired.
            </p>
            <Link href="/">Go back to home page</Link>
          </main>
        )}
      {data.message === "Code needed and Email needed" && (
        <main className={styles.container2}>
          <p>You didn&apos;t pass an email or code.</p>
          <p>
            We couldn&apos;t verify your email because you didn&apos;t pass the
            necesaary values
            <br />
            <br />
            This could have happened because you didn&apos;t copy the code
            correctly or you forgot to pass the necesaary values
          </p>
          <Link href="/">Go back to home page</Link>
        </main>
      )}
      {data.message === "Email needed" && (
        <main className={styles.container2}>
          <p>You didn&apos;t pass an email.</p>
          <p>
            We couldn&apos;t verify your email because you didn&apos;t pass the
            necesaary values
            <br />
            <br />
            This could have happened because you didn&apos;t copy the code
            correctly or you forgot to pass the necesaary values
          </p>
          <Link href="/">Go back to home page</Link>
        </main>
      )}
      {data.message === "Code needed" && (
        <main className={styles.container2}>
          <p>You didn&apos;t pass a verification code.</p>
          <p>
            We couldn&apos;t verify your email because you didn&apos;t pass the
            necesaary values
            <br />
            <br />
            This could have happened because you didn&apos;t copy the code
            correctly or you forgot to pass the necesaary values
          </p>
          <button>Go back to home page</button>
        </main>
      )}
      {data.message === "Invalid code" && (
        <main className={styles.container2}>
          <p>The code that you passed in was incorrect.</p>
          <p>
            The code you gave us didn&pos;t match the one in our database
            <br />
            <br />
            This could have happened because you copied the code incorrectly
          </p>
          <button>Go back to home page</button>
        </main>
      )}
    </div>
  );
};

export default Page;
