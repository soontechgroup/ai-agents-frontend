import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | AI数字人',
    default: 'AI数字人',
  },
  description: 'AI数字人交互平台',
};

export default function DigitalHumanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}