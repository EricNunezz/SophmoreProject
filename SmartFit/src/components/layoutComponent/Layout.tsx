import React from "react";
import Header from "./header";
import Footer from "./footer";

type LayoutProps = {
  children: React.ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#2E382E] text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout; 