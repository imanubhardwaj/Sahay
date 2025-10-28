import { Schedule } from '../../src/models';

export const seedSchedules = async (users: any[]) => {
  console.log('🌱 Seeding schedules...');
  
  const schedulesData = [
    {
      professionalId: users[0]?._id,
      title: 'Mentoring Session',
      description: 'Weekly mentoring session with students',
      date: new Date('2024-01-15T10:00:00Z'),
      startTime: new Date('2024-01-15T10:00:00Z'),
      endTime: new Date('2024-01-15T11:00:00Z'),
      isRecurring: true,
      recurringPattern: 'weekly',
      recurringEndDate: new Date('2024-12-31T23:59:59Z'),
      price: 50,
      maxBookings: 5,
      isActive: true
    }
  ];

  const schedules = await Schedule.insertMany(schedulesData);
  console.log(`✅ Seeded ${schedules.length} schedules`);
  
  return schedules;
};
