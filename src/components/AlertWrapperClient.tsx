"use client";

import dynamic from "next/dynamic";

const AlertWrapper = dynamic(
  () =>
    import("../../packages/ui/components/Alert/Wrapper").then(
      (m) => m.default,
    ),
  { ssr: false },
);

export function AlertWrapperClient() {
  return <AlertWrapper />;
}
