# Thrive PCOS - Frontend

A modern, beautiful web app for tracking PCOS symptoms, mood, and mental health.

## ✨ Features

- 🔐 **Authentication** - Secure login and registration with Supabase
- 📊 **Mood Tracking** - Daily mood logging with PHQ-2 and GAD-2 assessments
- 📈 **Visualizations** - Interactive charts showing mood trends
- 💡 **Insights** - Mental health screening with depression and anxiety risk scores
- 📱 **Mobile-First** - Fully responsive design that works on all devices
- 🎨 **Beautiful UI** - Modern design with Tailwind CSS

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
```

Replace `your-backend-url.vercel.app` with your actual backend API URL.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## 📦 Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = your backend URL
6. Click "Deploy"

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **HTTP Client:** Axios
- **Date Handling:** date-fns

## 📱 Features Breakdown

### Authentication
- Email/password registration
- Secure login
- JWT token management
- Automatic session handling

### Mood Tracking
- Simple 1-5 mood score
- PHQ-2 depression screening
- GAD-2 anxiety screening
- Energy and anxiety level tracking
- Daily notes

### Dashboard
- Quick stats cards showing:
  - Average mood
  - Mood trend (improving/stable/declining)
  - Depression risk level
  - Anxiety risk level
- 30-day mood trend chart
- Recent entries list
- Easy mood entry logging

## 🎨 Color Scheme

Primary colors (PCOS-friendly pink):
- `primary-500`: #ed4a9c
- `primary-600`: #db2877
- `primary-700`: #be1a5e

## 📁 Project Structure

```
thrive-frontend/
├── app/
│   ├── dashboard/       # Dashboard page
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing/login page
├── components/
│   ├── MoodChart.tsx    # Mood visualization
│   ├── MoodForm.tsx     # Mood entry form
│   └── StatsCards.tsx   # Stats display
├── lib/
│   └── api.ts           # API client
└── public/              # Static assets
```

## 🔧 Configuration Files

- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `postcss.config.js` - PostCSS configuration

## 🧪 Development

The app uses:
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting (recommended)

## 📝 API Integration

The app connects to your backend API at the URL specified in `NEXT_PUBLIC_API_URL`.

Required endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/mood` - Create mood entry
- `GET /api/mood` - Get mood entries
- `GET /api/mood/stats` - Get mood statistics

## 🎯 Roadmap

Future features to add:
- [ ] Symptom tracking
- [ ] Medication tracking
- [ ] Cycle tracking
- [ ] Lab results
- [ ] Educational articles
- [ ] Community forum
- [ ] Push notifications
- [ ] Export data

## 📄 License

MIT License - feel free to use this project however you'd like!

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 💬 Support

For issues or questions, please reach out via GitHub issues.

---

Built with ❤️ for women with PCOS
