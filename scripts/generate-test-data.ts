import { faker } from '@faker-js/faker';
import { db } from '../server/db.ts';
import { applications } from '../shared/schema.ts';

const JOB_STATUSES = ['Applied', 'Interviewing', 'Offer', 'Rejected'];
const APPLICATION_STAGES = ['In Review', 'HR Round', 'Hiring Manager Round', 'Panel Interview', 'Final Round', 'Offer', 'Rejected'];
const MODES_OF_APPLICATION = ['LinkedIn', 'Company Website', 'Referral', 'Job Board', 'Recruiter'];

async function generateTestData(count = 1000) {
  console.log(`Generating ${count} test applications...`);
  
  const testApplications = Array.from({ length: count }, () => ({
    userId: 1, // Using the mock user ID
    dateApplied: faker.date.past({ years: 1 }).toISOString().split('T')[0],
    companyName: faker.company.name(),
    roleTitle: faker.person.jobTitle(),
    roleUrl: faker.internet.url(),
    jobStatus: faker.helpers.arrayElement(JOB_STATUSES),
    applicationStage: faker.helpers.arrayElement(APPLICATION_STAGES),
    resumeVersion: `v${faker.number.int({ min: 1, max: 5 })}`,
    modeOfApplication: faker.helpers.arrayElement(MODES_OF_APPLICATION),
    followUpDate: faker.datatype.boolean() ? faker.date.future().toISOString().split('T')[0] : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  try {
    // Insert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < testApplications.length; i += batchSize) {
      const batch = testApplications.slice(i, i + batchSize);
      await db.insert(applications).values(batch);
      console.log(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(testApplications.length / batchSize)}`);
    }
    
    console.log('✅ Test data generation complete!');
  } catch (error) {
    console.error('Error generating test data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const count = parseInt(process.argv[2]) || 1000;
  generateTestData(count)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export { generateTestData }; 