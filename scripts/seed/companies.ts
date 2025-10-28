import { Company } from '../../src/models';

export const seedCompanies = async () => {
  console.log('🌱 Seeding companies...');
  
  const companiesData = [
    {
      name: 'Google',
      address: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
      website: 'https://www.google.com',
      email: 'careers@google.com'
    },
    {
      name: 'Microsoft',
      address: 'One Microsoft Way, Redmond, WA 98052, USA',
      website: 'https://www.microsoft.com',
      email: 'careers@microsoft.com'
    },
    {
      name: 'Amazon',
      address: '410 Terry Avenue North, Seattle, WA 98109, USA',
      website: 'https://www.amazon.com',
      email: 'careers@amazon.com'
    },
    {
      name: 'Apple',
      address: 'One Apple Park Way, Cupertino, CA 95014, USA',
      website: 'https://www.apple.com',
      email: 'careers@apple.com'
    },
    {
      name: 'Meta (Facebook)',
      address: '1 Hacker Way, Menlo Park, CA 94025, USA',
      website: 'https://www.meta.com',
      email: 'careers@meta.com'
    },
    {
      name: 'Netflix',
      address: '100 Winchester Circle, Los Gatos, CA 95032, USA',
      website: 'https://www.netflix.com',
      email: 'careers@netflix.com'
    },
    {
      name: 'Uber',
      address: '1455 Market Street, San Francisco, CA 94103, USA',
      website: 'https://www.uber.com',
      email: 'careers@uber.com'
    },
    {
      name: 'Airbnb',
      address: '888 Brannan Street, San Francisco, CA 94103, USA',
      website: 'https://www.airbnb.com',
      email: 'careers@airbnb.com'
    },
    {
      name: 'Tesla',
      address: '1 Tesla Road, Austin, TX 78725, USA',
      website: 'https://www.tesla.com',
      email: 'careers@tesla.com'
    },
    {
      name: 'SpaceX',
      address: '1 Rocket Road, Hawthorne, CA 90250, USA',
      website: 'https://www.spacex.com',
      email: 'careers@spacex.com'
    },
    {
      name: 'Infosys',
      address: 'Electronics City, Hosur Road, Bangalore 560100, India',
      website: 'https://www.infosys.com',
      email: 'careers@infosys.com'
    },
    {
      name: 'TCS (Tata Consultancy Services)',
      address: 'Nirmal Building, 9th Floor, Nariman Point, Mumbai 400021, India',
      website: 'https://www.tcs.com',
      email: 'careers@tcs.com'
    },
    {
      name: 'Wipro',
      address: 'Doddakannelli, Sarjapur Road, Bangalore 560035, India',
      website: 'https://www.wipro.com',
      email: 'careers@wipro.com'
    },
    {
      name: 'HCL Technologies',
      address: 'A-10, Sector 3, Noida, Uttar Pradesh 201301, India',
      website: 'https://www.hcl.com',
      email: 'careers@hcl.com'
    },
    {
      name: 'Accenture',
      address: 'DLF IT Park, Block 1, 8th Floor, Chennai 600089, India',
      website: 'https://www.accenture.com',
      email: 'careers@accenture.com'
    },
    {
      name: 'Cognizant',
      address: '5/639, Old Mahabalipuram Road, Chennai 600096, India',
      website: 'https://www.cognizant.com',
      email: 'careers@cognizant.com'
    },
    {
      name: 'Capgemini',
      address: 'SEZ Unit, Cessna Business Park, Bangalore 560087, India',
      website: 'https://www.capgemini.com',
      email: 'careers@capgemini.com'
    },
    {
      name: 'IBM',
      address: 'Manyata Tech Park, Bangalore 560045, India',
      website: 'https://www.ibm.com',
      email: 'careers@ibm.com'
    },
    {
      name: 'Oracle',
      address: 'Oracle Parkway, Redwood Shores, CA 94065, USA',
      website: 'https://www.oracle.com',
      email: 'careers@oracle.com'
    },
    {
      name: 'Salesforce',
      address: '415 Mission Street, San Francisco, CA 94105, USA',
      website: 'https://www.salesforce.com',
      email: 'careers@salesforce.com'
    }
  ];

  const companies = await Company.insertMany(companiesData);
  console.log(`✅ Seeded ${companies.length} companies`);
  
  return companies;
};
