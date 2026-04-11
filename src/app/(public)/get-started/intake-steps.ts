export interface IntakeStepConfig {
  id: string;
  label: string;
  shortLabel: string;
}

export const intakeSteps: IntakeStepConfig[] = [
  { id: 'business-snapshot', label: 'Business Snapshot', shortLabel: 'Business' },
  { id: 'capacity-stage', label: 'Where You Are Now', shortLabel: 'Stage' },
  { id: 'clients-flow', label: 'Your Clients', shortLabel: 'Clients' },
  { id: 'marketing-reality', label: 'Marketing Reality', shortLabel: 'Marketing' },
  { id: 'offers-goals-voice', label: 'Goals and Voice', shortLabel: 'Goals' },
  { id: 'consent', label: 'You Made It', shortLabel: 'Done' },
];

export const TOTAL_INTAKE_STEPS = intakeSteps.length;
