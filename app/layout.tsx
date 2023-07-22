"use client"

import Navbar from "@/components/Navbar";
import SignedInNavbar from "@/components/SignedInNavbar";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { usePathname } from 'next/navigation'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const inter = Inter({ subsets: ["latin"] });

const notSignedInPaths: String[] = ["/","why-taskmaster","features","signUp","logIn"]

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
        {notSignedInPaths.every(val => val !== usePathname()) ? (
          <SignedInNavbar/>
        ): (
          <Navbar />  
        )}
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
