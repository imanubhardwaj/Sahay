import { UserSchedule } from '../../src/models';

export const seedUserSchedules = async (users: any[]) => {
  console.log('🌱 Seeding user schedules...');
  
  const userSchedulesData = [
    {
      userId: users[0]?._id,
      day: 'monday',
      startTime: '09:00',
      endTime: '17:00',
      timezone: 'IST'
    }
  ];

  const userSchedules = await UserSchedule.insertMany(userSchedulesData);
  console.log(`✅ Seeded ${userSchedules.length} user schedules`);
  
  return userSchedules;
};
