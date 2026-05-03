import { notFound } from "next/navigation";
import { PlaygroundClient } from "./PlaygroundClient";

export default function ThemePlaygroundPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }
  return <PlaygroundClient />;
}
