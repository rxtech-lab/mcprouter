import { notFound } from "next/navigation";
import { getPublicMcpServerDetail } from "@/app/actions/mcp-actions";
import { ServerDetailClient } from "./ServerDetailClient";

interface ServerPageProps {
  params: {
    id: string;
  };
}

export default async function ServerPage({ params }: ServerPageProps) {
  const server = await getPublicMcpServerDetail(params.id);

  if (!server) {
    notFound();
  }

  return <ServerDetailClient server={server} />;
}
