import React from 'react';
import HeaderShell from "components/layout/HeaderShell";
import FooterShell from "components/layout/FooterShell";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeaderShell />
      <main className="flex-grow">
        {children}
      </main>
      <FooterShell locationSlug={null} />
    </>
  );
}
