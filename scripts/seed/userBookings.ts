import { UserBooking } from '../../src/models';

export const seedUserBookings = async (users: any[]) => {
  console.log('🌱 Seeding user bookings...');
  
  const userBookingsData = [
    {
      userId: users[0]?._id,
      participants: [users[1]?._id],
      bookingDateTime: new Date('2024-01-15T10:00:00Z'),
      duration: 60,
      status: 'confirmed'
    }
  ];

  const userBookings = await UserBooking.insertMany(userBookingsData);
  console.log(`✅ Seeded ${userBookings.length} user bookings`);
  
  return userBookings;
};
