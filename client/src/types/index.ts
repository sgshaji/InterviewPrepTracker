export interface Application {
  id: string;
  companyName: string;
  roleTitle: string;
  jobStatus: string;
  applicationStage?: string;
  resumeVersion?: string;
  modeOfApplication?: string;
  dateApplied?: string;
  // Add any other fields your app uses
} 