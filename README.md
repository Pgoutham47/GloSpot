# GloSpot - AI Sports Talent Assessment PWA

A Progressive Web App for AI-powered sports talent assessment using pose estimation and computer vision.

## Features

### 🏃‍♂️ Mobile-First Design
- Responsive design optimized for mobile devices
- Clean, modern UI inspired by banking/finance apps
- Bottom navigation for easy access
- Offline-first architecture

### 🤖 AI-Powered Assessment
- Real-time pose estimation using TensorFlow Lite/MediaPipe
- On-device analysis for instant feedback
- Cheat detection engine for accurate results
- Age, gender, and sport-specific benchmarking

### 📊 Comprehensive Testing
- Vertical Jump Test
- Push-ups Test
- Sit-ups Test
- Plank Hold Test
- Squats Test
- Burpees Test

### 🔄 Offline Support
- Record tests without internet connection
- Local storage of test data
- Works completely offline
- Data persists between sessions

### 📱 PWA Features
- Installable on mobile devices
- Push notifications for test reminders
- Service worker for offline functionality
- App-like experience

## Project Structure

```
GloSpot/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── app.js             # Main JavaScript application
├── manifest.json      # PWA manifest
├── sw.js             # Service worker
├── icons/            # App icons directory
└── README.md         # This file
```

## Getting Started

1. **Open the app**: Simply open `index.html` in a web browser
2. **Install as PWA**: Use "Add to Home Screen" on mobile devices
3. **Start testing**: Sign up/in and begin recording fitness tests

## Workflow

1. **Onboarding** → Welcome screen with app introduction
2. **Authentication** → Sign in/Sign up with email
3. **Home Dashboard** → Overview of tests and recent results
4. **Test Selection** → Choose from available fitness tests
5. **Recording** → Record video with camera access
6. **AI Analysis** → Real-time pose estimation and feedback
7. **Results** → Detailed performance metrics and scoring
8. **Profile** → User stats and settings

## Technical Implementation

### Frontend Technologies
- **HTML5** with semantic markup
- **CSS3** with modern features (Grid, Flexbox, Custom Properties)
- **Vanilla JavaScript** with ES6+ features
- **Progressive Web App** standards

### AI Integration (Planned)
- **TensorFlow Lite** for on-device pose estimation
- **MediaPipe** for real-time pose detection
- **MoveNet/PoseNet** for movement analysis
- **Custom models** for sport-specific assessments

### Offline Capabilities
- **Service Worker** for caching and offline functionality
- **Local Storage** for data persistence
- **Offline-first** design for reliable performance
- **Push Notifications** for engagement

## Browser Support

- **Chrome** 80+ (recommended)
- **Firefox** 75+
- **Safari** 13+
- **Edge** 80+

## Development

To run locally:
1. Clone or download the project
2. Open `index.html` in a web browser
3. For PWA features, serve via HTTPS (use Live Server extension in VS Code)

## Future Enhancements

- [ ] Real AI integration with TensorFlow Lite
- [ ] Coach/Administrator dashboard
- [ ] Advanced analytics and reporting
- [ ] Social features and leaderboards
- [ ] Multi-language support
- [ ] Dark mode theme

## License

This project is part of the GloSpot sports assessment platform.
