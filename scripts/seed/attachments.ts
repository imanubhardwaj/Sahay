import { Attachment } from '../../src/models';

export const seedAttachments = async () => {
  console.log('🌱 Seeding attachments...');
  
  const attachmentsData = [
    {
      url: 'https://example.com/avatars/avatar1.jpg',
      type: 'image'
    },
    {
      url: 'https://example.com/avatars/avatar2.jpg',
      type: 'image'
    },
    {
      url: 'https://example.com/avatars/avatar3.jpg',
      type: 'image'
    },
    {
      url: 'https://example.com/avatars/avatar4.jpg',
      type: 'image'
    },
    {
      url: 'https://example.com/avatars/avatar5.jpg',
      type: 'image'
    },
    {
      url: 'https://example.com/avatars/avatar6.jpg',
      type: 'image'
    },
    {
      url: 'https://example.com/avatars/avatar7.jpg',
      type: 'image'
    },
    {
      url: 'https://example.com/avatars/avatar8.jpg',
      type: 'image'
    },
    {
      url: 'https://example.com/avatars/avatar9.jpg',
      type: 'image'
    },
    {
      url: 'https://example.com/avatars/avatar10.jpg',
      type: 'image'
    },
    {
      url: 'https://example.com/documents/resume1.pdf',
      type: 'pdf'
    },
    {
      url: 'https://example.com/documents/resume2.pdf',
      type: 'pdf'
    },
    {
      url: 'https://example.com/documents/resume3.pdf',
      type: 'pdf'
    },
    {
      url: 'https://example.com/videos/tutorial1.mp4',
      type: 'video'
    },
    {
      url: 'https://example.com/videos/tutorial2.mp4',
      type: 'video'
    },
    {
      url: 'https://example.com/audio/lecture1.mp3',
      type: 'audio'
    },
    {
      url: 'https://example.com/audio/lecture2.mp3',
      type: 'audio'
    },
    {
      url: 'https://example.com/code/example1.js',
      type: 'code'
    },
    {
      url: 'https://example.com/code/example2.py',
      type: 'code'
    },
    {
      url: 'https://example.com/documents/guide1.pdf',
      type: 'document'
    }
  ];

  const attachments = await Attachment.insertMany(attachmentsData);
  console.log(`✅ Seeded ${attachments.length} attachments`);
  
  return attachments;
};
