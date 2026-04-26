import type { ConciergeScreenConfig, ConciergeAnswers } from './concierge-types';

export const welcomeScreen = {
  eyebrow: 'The Marketing Reset',
  heading: 'Before we dive in, let me learn a little about you.',
  body: 'I am Karli, and I created The Marketing Reset for service-based business owners who are tired of guessing with their marketing. Over the next few screens, I will ask you a few quick questions. Your answers help me understand where you are before you start your consultation. Everything you share stays between us.',
  cta: "Let's get started",
};

export const screens: ConciergeScreenConfig[] = [
  {
    id: 'business-stage',
    eyebrow: 'Question 1 of 5',
    heading: 'Where are you in your business right now?',
    subtext:
      'There is no wrong answer. This helps me calibrate the strategy to your actual situation.',
    formField: 'q11',
    allowOther: true,
    options: [
      {
        id: 'just_starting',
        label: 'Just starting out',
        description:
          'Building from scratch and figuring things out as you go',
      },
      {
        id: 'inconsistent',
        label: 'Established but inconsistent',
        description:
          'Some weeks are great, others are quiet, and you are not sure why',
      },
      {
        id: 'fully_booked',
        label: 'Fully booked',
        description:
          'You have the clients, but you want better-fit people or higher pricing',
      },
      {
        id: 'overwhelmed',
        label: 'Overwhelmed',
        description:
          'You are doing too much and something has to give',
      },
      {
        id: 'stagnant',
        label: 'Stagnant or plateaued',
        description:
          'Things are fine but you feel stuck and unsure what is next',
      },
      {
        id: 'other',
        label: 'Other',
        description: 'Describe your situation in your own words',
      },
    ],
  },
  {
    id: 'primary-goal',
    eyebrow: 'Question 2 of 5',
    heading: 'What matters most to you right now?',
    subtext:
      'Pick the one thing that, if it changed, would make the biggest difference.',
    formField: 'q12',
    allowOther: false,
    options: [
      {
        id: 'more_clients',
        label: 'More clients',
        description: 'My schedule has too many open spots right now',
      },
      {
        id: 'consistent_bookings',
        label: 'More consistent bookings',
        description: 'I want steady work, not feast-or-famine',
      },
      {
        id: 'better_fit',
        label: 'Better-fit clients',
        description: 'I want to work with people who value what I do',
      },
      {
        id: 'increase_pricing',
        label: 'Increase my pricing',
        description:
          'I know I am undercharging but I am not sure how to shift',
      },
      {
        id: 'free_up_schedule',
        label: 'Free up my schedule',
        description:
          'I do not have enough time to add marketing on top of everything else I am already doing',
      },
    ],
  },
  {
    id: 'marketing-reality',
    eyebrow: 'Question 3 of 5',
    heading: 'How would you describe your marketing right now?',
    subtext:
      'Most service providers were never taught this. No judgment here.',
    formField: 'q21',
    allowOther: false,
    options: [
      {
        id: 'no_marketing',
        label: 'Word of mouth only',
        description:
          'Clients find me through referrals and I do not really market',
      },
      {
        id: 'occasional',
        label: 'Occasional posting',
        description:
          'I show up on social media when I feel inspired or remember',
      },
      {
        id: 'regular_no_results',
        label: 'Regular but not working',
        description:
          'I am posting consistently but it does not seem to bring clients',
      },
      {
        id: 'referrals_only',
        label: 'Referrals and repeats',
        description:
          'Almost all my business comes from people I already know',
      },
      {
        id: 'tried_unclear',
        label: 'Tried everything',
        description:
          'I have done courses, ads, content plans, and none of it stuck',
      },
      {
        id: 'overwhelmed',
        label: 'Do not know where to start',
        description:
          'I feel overwhelmed and I just need someone to tell me what to focus on',
      },
      {
        id: 'wrong_clients',
        label: 'My marketing is working -- but it is bringing in the wrong clients',
        description:
          'I am consistently booking but the clients do not align with who I want to work with',
      },
    ],
  },
  {
    id: 'biggest-constraint',
    eyebrow: 'Question 4 of 5',
    heading: 'What are the biggest things standing in your way?',
    subtext:
      'Select all that apply. Knowing your real constraints helps me build a strategy that actually fits your life.',
    formField: 'q39',
    multiSelect: true,
    options: [
      {
        id: 'money',
        label: 'Money',
        description: 'I cannot invest much right now',
      },
      {
        id: 'confidence',
        label: 'Confidence',
        description: 'I do not trust my own marketing instincts',
      },
      {
        id: 'consistency',
        label: 'Consistency',
        description: 'I start things but never stick with them',
      },
      {
        id: 'clarity',
        label: 'Clarity',
        description: 'I do not even know what my brand should be',
      },
      {
        id: 'direction',
        label: 'Direction',
        description: 'I genuinely do not know what works and what does not',
      },
      {
        id: 'time_energy',
        label: 'Time and energy',
        description:
          'I went to school to master my craft, not to be a photographer, video editor, meeting manager, and marketing agent. It is all consuming.',
      },
      {
        id: 'alignment',
        label: 'Uncertainty about alignment',
        description:
          'I am marketing well but not sure I am attracting the right people',
      },
    ],
  },
];

const stageSentences: Record<string, string> = {
  just_starting:
    'You are just getting started and building your business from the ground up.',
  inconsistent:
    'You are an established business owner dealing with inconsistent seasons.',
  fully_booked:
    'Your schedule is full, but you are ready to attract better-fit clients or raise your pricing.',
  overwhelmed:
    'You are overwhelmed and need to simplify before burnout takes over.',
  stagnant:
    'You have hit a plateau and are ready for a new direction.',
  other: '',
};

const goalSentences: Record<string, string> = {
  more_clients:
    'Your main focus right now is filling your schedule with more clients.',
  consistent_bookings:
    'Your main focus right now is getting more consistent bookings.',
  better_fit:
    'Your main focus right now is attracting clients who truly value your work.',
  increase_pricing:
    'Your main focus right now is raising your prices to reflect your real value.',
  free_up_schedule:
    'You need to free up your schedule so marketing does not consume everything.',
};

const marketingSentences: Record<string, string> = {
  no_marketing:
    'Marketing has mostly been word of mouth up to this point.',
  occasional:
    'Marketing has been sporadic, happening when motivation strikes.',
  regular_no_results:
    'You have been showing up consistently, but the results have not matched the effort.',
  referrals_only:
    'Your business has relied almost entirely on referrals and repeat clients.',
  tried_unclear:
    'You have tried many approaches, but nothing has felt clear or consistent.',
  overwhelmed:
    'Marketing has felt overwhelming, and you need someone to help you cut through the noise.',
  wrong_clients:
    'Your marketing is working, but it is attracting the wrong people.',
};

const constraintSentences: Record<string, string> = {
  money: 'budget is tight',
  confidence: 'you do not fully trust your marketing instincts',
  consistency: 'sticking with things has been hard',
  clarity: 'you are not sure what your brand should be',
  direction: 'you are not sure what actually works',
  time_energy: 'time and energy are your biggest bottleneck',
  alignment: 'you are not sure your marketing is attracting the right people',
};

export function buildSummary(answers: ConciergeAnswers): string {
  const parts: string[] = [];

  if (answers.businessStage === 'other' && answers.businessStageOther) {
    parts.push(`You described your situation: "${answers.businessStageOther}"`);
  } else if (answers.businessStage && stageSentences[answers.businessStage]) {
    parts.push(stageSentences[answers.businessStage]);
  }

  if (answers.primaryGoal && goalSentences[answers.primaryGoal]) {
    parts.push(goalSentences[answers.primaryGoal]);
  }

  if (answers.marketingApproach && marketingSentences[answers.marketingApproach]) {
    parts.push(marketingSentences[answers.marketingApproach]);
  }

  if (answers.biggestConstraints.length > 0) {
    const constraintParts = answers.biggestConstraints
      .map((c) => constraintSentences[c])
      .filter(Boolean);
    if (constraintParts.length === 1) {
      parts.push(`The biggest thing standing in your way: ${constraintParts[0]}.`);
    } else if (constraintParts.length > 1) {
      const last = constraintParts.pop();
      parts.push(`The things standing in your way: ${constraintParts.join(', ')}, and ${last}.`);
    }
  }

  return parts.join(' ');
}

export const summaryScreen = {
  heading: 'Here is what I heard.',
  subtext:
    'The consultation ahead goes deeper into your business, your clients, your goals, and your current setup. It takes about 15 to 20 minutes. The more honest and detailed you are, the more useful your strategy session will be.',
  cta: 'Continue to Your Consultation',
};
