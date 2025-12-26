# Sahay - Modern Learning Platform 🚀

A comprehensive learning platform built with Next.js, TypeScript, and Tailwind CSS. Features include interactive modules, community Q&A, mentor sessions, portfolio management, and gamification with mock data for frontend development.

## ✨ Features

### 🎓 Learning Modules
- Interactive learning content with quizzes
- Progress tracking and completion certificates
- Multiple difficulty levels (Beginner, Intermediate, Advanced)
- Points and achievement system

### 💬 Community Q&A
- Ask and answer questions
- Tag-based organization
- Upvoting system
- Real-time discussions

### 👨‍🏫 Mentor Network
- Find and book mentor sessions
- Quick (15 min) and Detailed (60 min) sessions
- Point-based booking system
- Mentor availability tracking
- Mentor profile management
- Work experience and social links
- Email-based approval workflow
- Zoom meeting integration
- Performance stats and earnings tracking

### 🎨 Portfolio Management
- Add and showcase projects
- Tech stack organization
- GitHub and live demo links
- Professional portfolio building

### 🏆 Leaderboard & Gamification
- Global and time-based rankings
- Achievement levels and badges
- Points system for all activities
- Progress visualization

### 📊 Analytics Dashboard
- Learning progress tracking
- Activity summaries
- Performance metrics
- Goal setting and tracking

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5.4, React 19.1.0, TypeScript 5.x
- **Styling**: Tailwind CSS 4.x with custom components
- **Backend**: Next.js API Routes, MongoDB, Mongoose 8.19.0
- **Authentication**: WorkOS Magic Links, JWT 9.0.2
- **Real-time**: Socket.io 4.8.1
- **Code Editor**: Monaco Editor 4.7.0
- **Email**: Nodemailer 7.0.10
- **Integrations**: Zoom API, OpenAI API
- **UI Components**: Custom component library, Material-UI 7.3.6
- **Icons**: Lucide React 0.544.0, React Icons 5.5.0
- **Deployment**: Vercel (recommended)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- MongoDB database (MongoDB Atlas recommended)
- WorkOS account (for authentication)
- Gmail account (for email notifications)
- Zoom account (for mentor sessions)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sahay
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Configure MongoDB connection string
   - Add WorkOS API keys
   - Set up Gmail SMTP credentials
   - Configure Zoom API credentials (optional)
   - See `DOCUMENTATION.md` for detailed setup

4. **Seed the database** (optional)
   ```bash
   pnpm seed
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard pages
│   │   ├── community/     # Q&A community
│   │   ├── mentors/       # Mentor booking
│   │   ├── modules/       # Learning modules
│   │   ├── portfolio/     # Project portfolio
│   │   └── leaderboard/   # Rankings
│   ├── onboarding/        # User onboarding
│   ├── login/             # Authentication
│   └── page.tsx          # Landing page
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── contexts/             # React contexts
├── lib/                  # Utilities and services
│   ├── mock-api.ts      # Mock API for frontend development
│   └── mock-api.ts      # Mock data (development)
└── styles/              # Global styles
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) to Purple (#8B5CF6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Neutral**: Gray scale

### Typography
- **Headings**: Inter font family
- **Body**: System font stack
- **Sizes**: Responsive typography scale

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Gradient backgrounds, hover effects
- **Forms**: Clean inputs with focus states
- **Navigation**: Collapsible sidebar with icons

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication (WorkOS)
WORKOS_API_KEY=sk_live_...
WORKOS_CLIENT_ID=client_...

# JWT
JWT_SECRET=your-super-secret-key

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password

# Zoom Integration (optional)
ZOOM_ACCOUNT_ID=your_account_id
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret

# OpenAI (for quiz evaluation)
OPENAI_API_KEY=sk-...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

See `DOCUMENTATION.md` for detailed setup instructions.

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Friendly**: Large tap targets, swipe gestures
- **Progressive Enhancement**: Works without JavaScript

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Other Platforms
- **Netlify**: Static site generation
- **Railway**: Full-stack deployment
- **DigitalOcean**: Custom server setup

## 🧪 Testing

### Demo Account
Use the built-in demo account for testing:
- **Email**: demo@sahay.com
- **Password**: password

### Test Features
- Complete onboarding flow
- Take learning modules
- Ask questions in community
- Book mentor sessions
- Add projects to portfolio

## 🔒 Security

- **Authentication**: WorkOS Magic Links with JWT tokens
- **Authorization**: Role-based access control
- **Data Protection**: Encrypted data transmission (HTTPS)
- **Input Validation**: Client and server-side validation
- **Secure Learning Flow**: Backend-controlled lesson progression
- **Quiz Security**: Answers validated server-side only
- **Booking Security**: Secure approval tokens for mentor sessions

## 📈 Performance

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io for live updates
- **Bundle Size**: Optimized imports and tree shaking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the code comments and README
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions
- **Community**: Join our Discord server

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core learning modules
- ✅ Community Q&A
- ✅ Mentor booking
- ✅ Portfolio management
- ✅ Leaderboard system

### Phase 2 (Planned)
- 🔄 Video content integration
- 🔄 Live coding sessions
- 🔄 Mobile app (React Native)
- 🔄 Advanced analytics
- 🔄 AI-powered recommendations

### Phase 3 (Future)
- 📅 Enterprise features
- 📅 API marketplace
- 📅 Certification system
- 📅 Job placement integration
- 📅 Multi-language support

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Supabase Team** for the backend infrastructure
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon set
- **Vercel** for the deployment platform

---

Built with ❤️ by the Sahay Team