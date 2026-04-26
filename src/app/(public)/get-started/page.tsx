import type { Metadata } from 'next';
import { GetStartedRouter } from './get-started-router';

export const metadata: Metadata = {
  title: 'Get Started',
  description:
    'Begin your Marketing Reset. Answer a few quick questions so we can understand where you are, then complete your consultation.',
};

export default function GetStartedPage() {
  return <GetStartedRouter />;
}
