import { Placeholder } from "@/components/shell/placeholder";

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <Placeholder path={`/units/${code}`} />;
}
