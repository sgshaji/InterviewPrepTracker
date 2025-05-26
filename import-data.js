// Script to import historical application data
const applications = [
  {
    companyName: "Wolt",
    roleTitle: "Product Lead",
    dateApplied: "2025-01-08",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Standard",
    roleUrl: "https://www.linkedin.com/jobs/view/4117600916/"
  },
  {
    companyName: "NewRelic",
    roleTitle: "Sr PM",
    dateApplied: "2025-01-08",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Standard"
  },
  {
    companyName: "Cloudera",
    roleTitle: "Sr PM",
    dateApplied: "2025-01-08",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Standard"
  },
  {
    companyName: "TaylorWessing",
    roleTitle: "AI PM",
    dateApplied: "2025-01-08",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Standard"
  },
  {
    companyName: "Primark",
    roleTitle: "Platform PM",
    dateApplied: "2025-01-08",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Standard"
  },
  {
    companyName: "Arm",
    roleTitle: "Platform PM - AI/ML",
    dateApplied: "2025-01-09",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Standard"
  },
  {
    companyName: "Walmart",
    roleTitle: "Staff PM",
    dateApplied: "2025-01-09",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Personal Referral",
    resumeVersion: "B2C"
  },
  {
    companyName: "Paypal",
    roleTitle: "Sr PM",
    dateApplied: "2025-01-09",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Platform"
  },
  {
    companyName: "Tealium",
    roleTitle: "Sr PM",
    dateApplied: "2025-01-12",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Platform Engineering"
  },
  {
    companyName: "OakNorth",
    roleTitle: "Technical PM",
    dateApplied: "2025-01-12",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Platform Engineering"
  },
  {
    companyName: "Expedia",
    roleTitle: "Sr PM",
    dateApplied: "2025-01-12",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "AI/ML"
  },
  {
    companyName: "Oracle",
    roleTitle: "Principal PM",
    dateApplied: "2025-01-15",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Personal Referral",
    resumeVersion: "B2B"
  },
  {
    companyName: "Adobe",
    roleTitle: "Sr PM",
    dateApplied: "2025-01-15",
    jobStatus: "Applied",
    applicationStage: "Applied",
    modeOfApplication: "Personal Referral",
    resumeVersion: "B2B"
  },
  {
    companyName: "Epicor",
    roleTitle: "PM",
    dateApplied: "2025-01-15",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Platform Engineering"
  },
  {
    companyName: "Atlassian",
    roleTitle: "Principal PM",
    dateApplied: "2025-01-15",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "B2B"
  },
  {
    companyName: "Walmart",
    roleTitle: "Staff PM",
    dateApplied: "2025-01-15",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Personal Referral",
    resumeVersion: "B2C"
  },
  {
    companyName: "Elastic",
    roleTitle: "Sr PM",
    dateApplied: "2025-01-16",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Personal Referral",
    resumeVersion: "Platform Engineering"
  },
  {
    companyName: "Dynatrace",
    roleTitle: "Principal PM",
    dateApplied: "2025-01-17",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Platform Engineering"
  },
  {
    companyName: "Stackoverflow",
    roleTitle: "Sr PM",
    dateApplied: "2025-01-18",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "AI/ML Custom"
  },
  {
    companyName: "Adobe",
    roleTitle: "Sr PM",
    dateApplied: "2025-01-18",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "AI/ML Custom"
  },
  {
    companyName: "Paypal",
    roleTitle: "Lead PM",
    dateApplied: "2025-01-20",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Custom - Lead PM"
  },
  {
    companyName: "Freetrade",
    roleTitle: "Senior PM",
    dateApplied: "2025-01-20",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "B2B"
  },
  {
    companyName: "JPMC",
    roleTitle: "PM",
    dateApplied: "2025-01-20",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Personal Referral",
    resumeVersion: "Standard"
  },
  {
    companyName: "Paypal",
    roleTitle: "Senior PM",
    dateApplied: "2025-01-23",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Platform"
  },
  {
    companyName: "Zalando",
    roleTitle: "Senior PM",
    dateApplied: "2025-01-24",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "B2B"
  },
  {
    companyName: "Preply",
    roleTitle: "Senior PM",
    dateApplied: "2025-01-24",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "B2C"
  },
  {
    companyName: "Microsoft",
    roleTitle: "Senior PM",
    dateApplied: "2025-01-24",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Personal Referral",
    resumeVersion: "Custom"
  },
  {
    companyName: "Bloomberg",
    roleTitle: "PM",
    dateApplied: "2025-01-24",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Custom"
  },
  {
    companyName: "Dremio",
    roleTitle: "Senior PM",
    dateApplied: "2025-01-28",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Cloud Infra"
  },
  {
    companyName: "Tripadvisor",
    roleTitle: "Senior PM",
    dateApplied: "2025-01-28",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Custom"
  },
  {
    companyName: "Medallia",
    roleTitle: "Senior PM",
    dateApplied: "2025-01-28",
    jobStatus: "Rejected",
    applicationStage: "Recruiter Screen",
    modeOfApplication: "Online Application",
    resumeVersion: "Platform"
  },
  {
    companyName: "Playolocity",
    roleTitle: "Senior PM",
    dateApplied: "2025-01-28",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Personal Referral",
    resumeVersion: "B2B"
  },
  {
    companyName: "DeliveryHero",
    roleTitle: "Senior PM",
    dateApplied: "2025-01-28",
    jobStatus: "Rejected",
    applicationStage: "Final Round",
    modeOfApplication: "Online Application",
    resumeVersion: "Custom"
  },
  {
    companyName: "Wise",
    roleTitle: "Principal PM",
    dateApplied: "2025-01-31",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Custom"
  },
  {
    companyName: "Lloyds Bank",
    roleTitle: "Cloud PO",
    dateApplied: "2025-02-03",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Custom"
  },
  {
    companyName: "Meta",
    roleTitle: "PM",
    dateApplied: "2025-01-11",
    jobStatus: "Rejected",
    applicationStage: "First Round",
    modeOfApplication: "Online Application",
    resumeVersion: "B2C"
  },
  {
    companyName: "JPMC",
    roleTitle: "PM",
    dateApplied: "2025-02-06",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "AI/ML"
  },
  {
    companyName: "JPMC",
    roleTitle: "PM",
    dateApplied: "2025-02-05",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "AI/ML"
  },
  {
    companyName: "Spotify",
    roleTitle: "PM",
    dateApplied: "2025-02-12",
    jobStatus: "Applied",
    applicationStage: "Applied",
    modeOfApplication: "Personal Referral",
    resumeVersion: "Custom"
  },
  {
    companyName: "Confluence",
    roleTitle: "Product Owner",
    dateApplied: "2025-02-14",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "AI/ML"
  },
  {
    companyName: "Datasnipper",
    roleTitle: "Senior PM",
    dateApplied: "2025-02-14",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Platform"
  },
  {
    companyName: "Amazon",
    roleTitle: "PM",
    dateApplied: "2025-02-19",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "B2C"
  },
  {
    companyName: "Amazon",
    roleTitle: "PM",
    dateApplied: "2025-02-19",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "B2C"
  },
  {
    companyName: "Walmart",
    roleTitle: "Staff PM",
    dateApplied: "2025-02-19",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Platform"
  },
  {
    companyName: "Just Eat",
    roleTitle: "Senior Technical PM",
    dateApplied: "2025-02-20",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Platform Engineering"
  },
  {
    companyName: "Adobe",
    roleTitle: "Product Manager",
    dateApplied: "2025-02-25",
    jobStatus: "Applied",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "B2C"
  },
  {
    companyName: "JetBrains",
    roleTitle: "Sr PM",
    dateApplied: "2025-03-03",
    jobStatus: "Applied",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Custom"
  },
  {
    companyName: "N26",
    roleTitle: "PM",
    dateApplied: "2025-03-03",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Custom"
  },
  {
    companyName: "Get Your Guide",
    roleTitle: "Sr PM",
    dateApplied: "2025-03-03",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "B2C"
  },
  {
    companyName: "Bolt",
    roleTitle: "Sr PM",
    dateApplied: "2025-03-03",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "B2C"
  },
  {
    companyName: "Intuit",
    roleTitle: "Sr PM",
    dateApplied: "2025-03-04",
    jobStatus: "Applied",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Custom"
  },
  {
    companyName: "Barclays",
    roleTitle: "Product Owner",
    dateApplied: "2025-03-06",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Platform Engineering"
  },
  {
    companyName: "Tesco",
    roleTitle: "Sr PM",
    dateApplied: "2025-03-06",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Cloud Infra"
  },
  {
    companyName: "ServiceNow",
    roleTitle: "Sr Principal PM",
    dateApplied: "2025-03-06",
    jobStatus: "Rejected",
    applicationStage: "Applied",
    modeOfApplication: "Online Application",
    resumeVersion: "Custom"
  },
  {
    companyName: "Trivago",
    roleTitle: "Sr PM",
    dateApplied: "2025-03-06",
    jobStatus: "Applied",
    applicationStage: "Second Round",
    modeOfApplication: "Online Application",
    resumeVersion: "Custom"
  },
  {
    companyName: "Walmart",
    roleTitle: "Sr PM",
    dateApplied: "2025-03-06",
    jobStatus: "Applied",
    applicationStage: "Applied",
    modeOfApplication: "Personal Referral",
    resumeVersion: "Standard"
  }
];

console.log(`Prepared ${applications.length} applications for import`);
console.log(JSON.stringify(applications, null, 2));