import "@/styles/globals.css";
import type { Metadata } from "next";
import { disableReactDevTools } from "@fvilers/disable-react-devtools";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const inter = Inter({ subsets: ["latin"] });

disableReactDevTools();

export const metadata: Metadata = {
  title: "TaskMaster",
  description: "The best task tracker around.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main>
          {children}
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