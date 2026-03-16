export interface IntakeStepConfig {
  id: string;
  label: string;
  shortLabel: string;
}

export const intakeSteps: IntakeStepConfig[] = [
  {
    id: 'business-snapshot',
    label: 'About Your Business',
    shortLabel: 'Business',
  },
  {
    id: 'capacity-stage',
    label: 'Where You Are Now',
    shortLabel: 'Stage',
  },
  {
    id: 'clients-flow',
    label: 'Your Clients',
    shortLabel: 'Clients',
  },
  {
    id: 'marketing-reality',
    label: 'Marketing Reality',
    shortLabel: 'Marketing',
  },
  {
    id: 'offers-tools-goals',
    label: 'Offers, Tools and Goals',
    shortLabel: 'Goals',
  },
  {
    id: 'final-details',
    label: 'Final Details',
    shortLabel: 'Final',
  },
];

export const TOTAL_INTAKE_STEPS = intakeSteps.length;
