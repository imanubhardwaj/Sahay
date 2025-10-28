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

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom components
- **Data**: Mock API for frontend development
- **UI Components**: Custom component library
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sahay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - No backend setup required - uses mock data
   - Copy your credentials to `.env.local`

4. **Start development server**
   ```bash
   npm run dev
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
Create a `.env.local` file:

```env
# No environment variables needed for mock data
```

### Mock Data Setup
The application uses mock data for frontend development. No backend setup is required.

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

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Row Level Security (RLS) policies
- **Data Protection**: Encrypted data transmission
- **Input Validation**: Client and server-side validation

## 📈 Performance

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Caching**: Supabase query caching
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