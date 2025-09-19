import { redirect } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

export default function DigitalHumanPage({ params }: PageProps) {
  redirect(`/digital-human/${params.id}/chat`);
}