import { Placeholder } from "@/components/shell/placeholder";

export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return <Placeholder path={`/settings/${section}`} />;
}
