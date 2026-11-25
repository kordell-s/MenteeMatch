import type { Metadata } from "next";
import Demo from "./Demo";

export const metadata: Metadata = {
  title: "NCBA demo",
  robots: { index: false, follow: false },
};

export default function NcbaDemoPage() {
  return <Demo />;
}
