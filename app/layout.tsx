import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const inter = Inter({ subsets: ["latin"] });
import { Analytics } from "@vercel/analytics/react";
import OverallNav from "@/components/OverallNav";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "TaskMaster",
  description: "The best task tracker around.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const navStatus = cookieStore.get("nav")?.value || "no-bar";

  return (
    <html lang="en">
      <body className={inter.className}>
        <main>
            <OverallNav navStatus={navStatus} />
          {children}
          <Analytics />
          <ToastContainer
            position="top-right"
            autoClose={2500}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable={false}
            pauseOnHover={false}
            theme="dark"
          />
        </main>
      </body>
    </html>
  );
}
