import KycProcessingClient from "./KycProcessingClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function KycProcessingPage({ params }: Props) {
  const { id } = await params;
  return <KycProcessingClient horseSlug={id} />;
}