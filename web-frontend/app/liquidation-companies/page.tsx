import { permanentRedirect } from 'next/navigation';

export default function LegacyCompaniesPage() {
  permanentRedirect('/suppliers');
}
