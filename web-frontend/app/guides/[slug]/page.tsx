import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { SectionHeading } from '@/components/section-heading';

export default async function GuideDetailPage(props: any) {
  // Guides API not yet implemented
  notFound();
}

type GuideSection = {
  heading: string;
  body?: string;
  checklist?: string[];
};
