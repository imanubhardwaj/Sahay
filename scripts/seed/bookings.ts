import { Booking } from '../../src/models';

export const seedBookings = async (users: any[], schedules: any[]) => {
  console.log('🌱 Seeding bookings...');
  
  const bookingsData = [
    {
      studentId: users[0]?._id, // John Doe (student)
      professionalId: users[2]?._id, // Mike Johnson (mentor)
      scheduleId: schedules[0]?._id,
      status: 'confirmed',
      sessionDate: '2024-01-15',
      sessionTime: '10:00',
      duration: 60,
      price: 50,
      paymentStatus: 'paid',
      location: 'online',
      sessionType: 'one-on-one',
      skills: [],
      requirements: []
    }
  ];

  const bookings = await Booking.insertMany(bookingsData);
  console.log(`✅ Seeded ${bookings.length} bookings`);
  
  return bookings;
};
