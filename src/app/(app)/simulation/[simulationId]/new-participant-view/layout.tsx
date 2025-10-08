import React from 'react';

export default function ParticipantViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This empty layout overrides the main (app) layout for this specific page,
  // effectively removing the header and sidebar.
  return <>{children}</>;
}
