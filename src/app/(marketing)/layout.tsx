import React from 'react';

/**
 * Marketing layout — wraps public pages like /pricing.
 * The global root layout (app/layout.tsx) already provides
 * <Providers>, <Header> padding, and <Footer>.
 * This layout adds no extra chrome so marketing pages
 * benefit from the global footer without double-wrapping.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
