import type { Metadata } from "next";
import { Prototipo } from "./Prototipo";

export const metadata: Metadata = {
  title: "Ko-op — Protótipo",
  description: "Protótipo navegável do app Ko-op: crie o servidor do grupo, pague só as horas jogadas e rache no Pix.",
};

export default function AppPage() {
  return <Prototipo />;
}
