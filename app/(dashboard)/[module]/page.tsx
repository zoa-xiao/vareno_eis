import { notFound } from "next/navigation";
import { ModuleView } from "@/components/module-view";
import { moduleDefinitions } from "@/lib/erp-data";

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const definition = moduleDefinitions[module];
  if (!definition) notFound();
  return <ModuleView moduleKey={module} definition={definition} />;
}
