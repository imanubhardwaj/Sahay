import { College } from '../../src/models';

export const seedColleges = async () => {
  console.log('🌱 Seeding colleges...');
  
  const collegesData = [
    {
      name: 'Indian Institute of Technology Bombay',
      address: 'Powai, Mumbai, Maharashtra 400076',
      website: 'https://www.iitb.ac.in',
      email: 'info@iitb.ac.in'
    },
    {
      name: 'Indian Institute of Technology Delhi',
      address: 'Hauz Khas, New Delhi, Delhi 110016',
      website: 'https://www.iitd.ac.in',
      email: 'info@iitd.ac.in'
    },
    {
      name: 'Indian Institute of Technology Madras',
      address: 'Chennai, Tamil Nadu 600036',
      website: 'https://www.iitm.ac.in',
      email: 'info@iitm.ac.in'
    },
    {
      name: 'Indian Institute of Technology Kanpur',
      address: 'Kanpur, Uttar Pradesh 208016',
      website: 'https://www.iitk.ac.in',
      email: 'info@iitk.ac.in'
    },
    {
      name: 'Indian Institute of Technology Kharagpur',
      address: 'Kharagpur, West Bengal 721302',
      website: 'https://www.iitkgp.ac.in',
      email: 'info@iitkgp.ac.in'
    },
    {
      name: 'National Institute of Technology Trichy',
      address: 'Tiruchirappalli, Tamil Nadu 620015',
      website: 'https://www.nitt.edu',
      email: 'info@nitt.edu'
    },
    {
      name: 'Delhi Technological University',
      address: 'Shahbad Daulatpur, Delhi 110042',
      website: 'https://www.dtu.ac.in',
      email: 'info@dtu.ac.in'
    },
    {
      name: 'Netaji Subhas University of Technology',
      address: 'Sector 3, Dwarka, New Delhi 110078',
      website: 'https://www.nsut.ac.in',
      email: 'info@nsut.ac.in'
    },
    {
      name: 'Vellore Institute of Technology',
      address: 'Vellore, Tamil Nadu 632014',
      website: 'https://www.vit.ac.in',
      email: 'info@vit.ac.in'
    },
    {
      name: 'Birla Institute of Technology and Science',
      address: 'Pilani, Rajasthan 333031',
      website: 'https://www.bits-pilani.ac.in',
      email: 'info@bits-pilani.ac.in'
    },
    {
      name: 'Manipal Institute of Technology',
      address: 'Manipal, Karnataka 576104',
      website: 'https://www.manipal.edu',
      email: 'info@manipal.edu'
    },
    {
      name: 'SRM Institute of Science and Technology',
      address: 'Kattankulathur, Tamil Nadu 603203',
      website: 'https://www.srmist.edu.in',
      email: 'info@srmist.edu.in'
    },
    {
      name: 'Amity University',
      address: 'Sector 125, Noida, Uttar Pradesh 201313',
      website: 'https://www.amity.edu',
      email: 'info@amity.edu'
    },
    {
      name: 'Lovely Professional University',
      address: 'Phagwara, Punjab 144411',
      website: 'https://www.lpu.in',
      email: 'info@lpu.in'
    },
    {
      name: 'Chandigarh University',
      address: 'Gharuan, Punjab 140413',
      website: 'https://www.cuchd.in',
      email: 'info@cuchd.in'
    }
  ];

  const colleges = await College.insertMany(collegesData);
  console.log(`✅ Seeded ${colleges.length} colleges`);
  
  return colleges;
};
