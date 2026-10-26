import { notFound } from "next/navigation";
import { ModuleView } from "@/components/module-view";
import { moduleDefinitions } from "@/lib/erp-data";
import { getModulePageData } from "@/lib/module-data";

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const definition = moduleDefinitions[module];
  if (!definition) notFound();
  const data = await getModulePageData(module, definition);
  return <ModuleView moduleKey={module} definition={definition} initialRows={data.rows} metrics={data.metrics} options={data.options} dataError={data.error} userRole={data.role} />;
}
