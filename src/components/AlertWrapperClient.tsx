"use client";

import dynamic from "next/dynamic";

const AlertWrapper = dynamic(
  () => import("../../packages/ui").then((m) => m.AlertWrapper),
  { ssr: false },
);

export function AlertWrapperClient() {
  return <AlertWrapper />;
}
