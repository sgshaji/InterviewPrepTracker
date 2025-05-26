const applications = [
  {"companyName": "NewRelic", "roleTitle": "Sr PM", "dateApplied": "2025-01-08", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Standard"},
  {"companyName": "Cloudera", "roleTitle": "Sr PM", "dateApplied": "2025-01-08", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Standard"},
  {"companyName": "TaylorWessing", "roleTitle": "AI PM", "dateApplied": "2025-01-08", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Standard"},
  {"companyName": "Primark", "roleTitle": "Platform PM", "dateApplied": "2025-01-08", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Standard"},
  {"companyName": "Arm", "roleTitle": "Platform PM - AI/ML", "dateApplied": "2025-01-09", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Standard"},
  {"companyName": "Walmart", "roleTitle": "Staff PM", "dateApplied": "2025-01-09", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Referral", "resumeVersion": "B2C"},
  {"companyName": "Paypal", "roleTitle": "Sr PM", "dateApplied": "2025-01-09", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Platform"},
  {"companyName": "Tealium", "roleTitle": "Sr PM", "dateApplied": "2025-01-12", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Platform Engineering"},
  {"companyName": "OakNorth", "roleTitle": "Technical PM", "dateApplied": "2025-01-12", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Platform Engineering"},
  {"companyName": "Expedia", "roleTitle": "Sr PM", "dateApplied": "2025-01-12", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "AI/ML"},
  {"companyName": "Oracle", "roleTitle": "Principal PM", "dateApplied": "2025-01-15", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Referral", "resumeVersion": "B2B"},
  {"companyName": "Adobe", "roleTitle": "Sr PM", "dateApplied": "2025-01-15", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Referral", "resumeVersion": "B2B"},
  {"companyName": "Epicor", "roleTitle": "PM", "dateApplied": "2025-01-15", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Platform Engineering"},
  {"companyName": "Atlassian", "roleTitle": "Principal PM", "dateApplied": "2025-01-15", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "B2B"},
  {"companyName": "Walmart", "roleTitle": "Staff PM", "dateApplied": "2025-01-15", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Referral", "resumeVersion": "B2C"},
  {"companyName": "Elastic", "roleTitle": "Sr PM", "dateApplied": "2025-01-16", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Referral", "resumeVersion": "Platform Engineering"},
  {"companyName": "Dynatrace", "roleTitle": "Principal PM", "dateApplied": "2025-01-17", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Platform Engineering"},
  {"companyName": "Stackoverflow", "roleTitle": "Sr PM", "dateApplied": "2025-01-18", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "AI/ML Custom"},
  {"companyName": "Adobe", "roleTitle": "Sr PM", "dateApplied": "2025-01-18", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "AI/ML Custom"},
  {"companyName": "Paypal", "roleTitle": "Lead PM", "dateApplied": "2025-01-20", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Lead PM"},
  {"companyName": "Freetrade", "roleTitle": "Senior PM", "dateApplied": "2025-01-20", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "B2B"},
  {"companyName": "JPMC", "roleTitle": "PM", "dateApplied": "2025-01-20", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Referral", "resumeVersion": "Standard"},
  {"companyName": "Paypal", "roleTitle": "Senior PM", "dateApplied": "2025-01-23", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Platform"},
  {"companyName": "Zalando", "roleTitle": "Senior PM", "dateApplied": "2025-01-24", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "B2B"},
  {"companyName": "Preply", "roleTitle": "Senior PM", "dateApplied": "2025-01-24", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "B2C"},
  {"companyName": "Microsoft", "roleTitle": "Senior PM", "dateApplied": "2025-01-24", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Referral", "resumeVersion": "Custom"},
  {"companyName": "Bloomberg", "roleTitle": "PM", "dateApplied": "2025-01-24", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Dremio", "roleTitle": "Senior PM", "dateApplied": "2025-01-28", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Cloud Infra"},
  {"companyName": "Tripadvisor", "roleTitle": "Senior PM", "dateApplied": "2025-01-28", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Medallia", "roleTitle": "Senior PM", "dateApplied": "2025-01-28", "jobStatus": "Rejected", "applicationStage": "HR Round", "modeOfApplication": "Online Application", "resumeVersion": "Platform"},
  {"companyName": "Playolocity", "roleTitle": "Senior PM", "dateApplied": "2025-01-28", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Referral", "resumeVersion": "B2B"},
  {"companyName": "DeliveryHero", "roleTitle": "Senior PM", "dateApplied": "2025-01-28", "jobStatus": "Rejected", "applicationStage": "Final Round", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Wise", "roleTitle": "Principal PM", "dateApplied": "2025-01-31", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Lloyds Bank", "roleTitle": "Cloud PO", "dateApplied": "2025-02-03", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Meta", "roleTitle": "PM", "dateApplied": "2025-01-11", "jobStatus": "Rejected", "applicationStage": "Technical Round", "modeOfApplication": "Online Application", "resumeVersion": "B2C"},
  {"companyName": "JPMC", "roleTitle": "PM", "dateApplied": "2025-02-06", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "AI/ML"},
  {"companyName": "JPMC", "roleTitle": "PM", "dateApplied": "2025-02-05", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "AI/ML"},
  {"companyName": "Spotify", "roleTitle": "PM", "dateApplied": "2025-02-12", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Referral", "resumeVersion": "Custom"},
  {"companyName": "Confluence", "roleTitle": "Product Owner", "dateApplied": "2025-02-14", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "AI/ML"},
  {"companyName": "Datasnipper", "roleTitle": "Senior PM", "dateApplied": "2025-02-14", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Platform"},
  {"companyName": "Amazon", "roleTitle": "PM Fresh", "dateApplied": "2025-02-19", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "B2C"},
  {"companyName": "Amazon", "roleTitle": "PM Insurance", "dateApplied": "2025-02-19", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "B2C"},
  {"companyName": "Walmart", "roleTitle": "Staff PM", "dateApplied": "2025-02-19", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Platform"},
  {"companyName": "Just Eat", "roleTitle": "Senior Technical PM", "dateApplied": "2025-02-20", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Platform Engineering"},
  {"companyName": "Adobe", "roleTitle": "Product Manager", "dateApplied": "2025-02-25", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "B2C"},
  {"companyName": "JetBrains", "roleTitle": "Sr PM", "dateApplied": "2025-03-03", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "N26", "roleTitle": "PM", "dateApplied": "2025-03-03", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Get Your Guide", "roleTitle": "Sr PM", "dateApplied": "2025-03-03", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "B2C"},
  {"companyName": "Bolt", "roleTitle": "Sr PM", "dateApplied": "2025-03-03", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "B2C"},
  {"companyName": "Intuit", "roleTitle": "Sr PM", "dateApplied": "2025-03-04", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Barclays", "roleTitle": "Product Owner", "dateApplied": "2025-03-06", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Platform Engineering"},
  {"companyName": "Tesco", "roleTitle": "Sr PM", "dateApplied": "2025-03-06", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Cloud Infra"},
  {"companyName": "ServiceNow", "roleTitle": "Sr Principal PM", "dateApplied": "2025-03-06", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Trivago", "roleTitle": "Sr PM", "dateApplied": "2025-03-06", "jobStatus": "Applied", "applicationStage": "Technical Round", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Walmart", "roleTitle": "Sr PM", "dateApplied": "2025-03-06", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Referral", "resumeVersion": "Standard"},
  {"companyName": "Agoda", "roleTitle": "Sr PM", "dateApplied": "2025-03-15", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "HelloFresh", "roleTitle": "Sr PM", "dateApplied": "2025-03-15", "jobStatus": "Rejected", "applicationStage": "HR Round", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Wise", "roleTitle": "Sr PM", "dateApplied": "2025-03-15", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Walmart", "roleTitle": "Staff PM", "dateApplied": "2025-03-16", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Referral", "resumeVersion": "Standard"},
  {"companyName": "Zalando", "roleTitle": "Principal PM", "dateApplied": "2025-03-16", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Salesforce", "roleTitle": "Senior PM", "dateApplied": "2025-03-16", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Referral", "resumeVersion": "Custom"},
  {"companyName": "JetBrains", "roleTitle": "PM", "dateApplied": "2025-03-24", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "AI/ML"},
  {"companyName": "Wise", "roleTitle": "PM", "dateApplied": "2025-03-24", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Referral", "resumeVersion": "B2C"},
  {"companyName": "Wayfair", "roleTitle": "PM", "dateApplied": "2025-03-24", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Referral", "resumeVersion": "B2C"},
  {"companyName": "N26", "roleTitle": "PM", "dateApplied": "2025-03-25", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Atlassian", "roleTitle": "Sr PM", "dateApplied": "2025-04-01", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Platform"},
  {"companyName": "Wolt", "roleTitle": "Product Lead", "dateApplied": "2025-04-12", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Babbel", "roleTitle": "Senior PM", "dateApplied": "2025-04-14", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "DeepL", "roleTitle": "Staff PM", "dateApplied": "2025-04-14", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Make", "roleTitle": "AI PM", "dateApplied": "2025-04-15", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "AI/ML"},
  {"companyName": "Trustpilot", "roleTitle": "Sr PM", "dateApplied": "2025-04-16", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "B2C"},
  {"companyName": "Dropbox", "roleTitle": "PM", "dateApplied": "2025-04-17", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Adobe", "roleTitle": "Senior PM", "dateApplied": "2025-04-17", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Adobe", "roleTitle": "Senior PM", "dateApplied": "2025-04-17", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "eBay", "roleTitle": "Senior PM", "dateApplied": "2025-04-17", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "DeliveryHero", "roleTitle": "Sr PM", "dateApplied": "2025-04-17", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "JetBrains", "roleTitle": "Sr PM", "dateApplied": "2025-04-22", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Siemens", "roleTitle": "Sr PM", "dateApplied": "2025-04-22", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Intuit", "roleTitle": "Sr PM", "dateApplied": "2025-04-22", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Target", "roleTitle": "Sr PM", "dateApplied": "2025-05-01", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Delivery Hero", "roleTitle": "Sr PM", "dateApplied": "2025-05-01", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Taxfix", "roleTitle": "Sr PM", "dateApplied": "2025-05-02", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Target", "roleTitle": "PM", "dateApplied": "2025-05-06", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Redhat", "roleTitle": "Sr PM", "dateApplied": "2025-05-07", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "NewRelic", "roleTitle": "Sr PM", "dateApplied": "2025-05-07", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Bluecore", "roleTitle": "Sr PM", "dateApplied": "2025-05-07", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Confluence", "roleTitle": "Principal PM", "dateApplied": "2025-05-07", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "NetApp", "roleTitle": "PM", "dateApplied": "2025-05-07", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Standard"},
  {"companyName": "Microsoft", "roleTitle": "Sr PM", "dateApplied": "2025-05-08", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Bolt", "roleTitle": "Sr PM", "dateApplied": "2025-05-09", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Arm", "roleTitle": "PM", "dateApplied": "2025-05-09", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Deel", "roleTitle": "PM", "dateApplied": "2025-05-09", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Viator", "roleTitle": "Sr PM", "dateApplied": "2025-05-09", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "B2B"},
  {"companyName": "Instapro", "roleTitle": "Sr PM", "dateApplied": "2025-05-09", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Datadog", "roleTitle": "PM", "dateApplied": "2025-05-09", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Uber", "roleTitle": "Sr PM", "dateApplied": "2025-05-10", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Salesforce", "roleTitle": "Sr PM", "dateApplied": "2025-05-10", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Wise", "roleTitle": "Sr PM", "dateApplied": "2025-05-11", "jobStatus": "Rejected", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Microsoft", "roleTitle": "Sr PM", "dateApplied": "2025-05-16", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Atlassian", "roleTitle": "Sr PM", "dateApplied": "2025-05-16", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "PayU", "roleTitle": "Sr PM", "dateApplied": "2025-05-16", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Intuit", "roleTitle": "Sr PM", "dateApplied": "2025-05-16", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Lloyds Bank", "roleTitle": "Sr PM", "dateApplied": "2025-05-25", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Miro", "roleTitle": "PM", "dateApplied": "2025-05-25", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Wayfair", "roleTitle": "PM", "dateApplied": "2025-05-25", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Intuit", "roleTitle": "Sr PM", "dateApplied": "2025-05-25", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Target", "roleTitle": "Sr PM", "dateApplied": "2025-05-25", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"},
  {"companyName": "Microsoft", "roleTitle": "Sr PM", "dateApplied": "2025-05-25", "jobStatus": "Applied", "applicationStage": "Applied", "modeOfApplication": "Online Application", "resumeVersion": "Custom"}
];

async function importApplications() {
  console.log(`Starting import of ${applications.length} applications...`);
  
  for (let i = 0; i < applications.length; i++) {
    try {
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applications[i])
      });
      
      if (response.ok) {
        console.log(`✓ Imported ${i + 1}/${applications.length}: ${applications[i].companyName} - ${applications[i].roleTitle}`);
      } else {
        console.log(`✗ Failed ${i + 1}/${applications.length}: ${applications[i].companyName} - ${response.status}`);
      }
    } catch (error) {
      console.log(`✗ Error ${i + 1}/${applications.length}: ${applications[i].companyName} - ${error.message}`);
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log('Import complete!');
}

// Run the import if this file is executed directly
if (typeof window === 'undefined') {
  importApplications();
}