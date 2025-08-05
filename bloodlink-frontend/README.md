# 🩸 Bloodlink - Blood Donor Platform

A modern, responsive web application for a blood donor platform built with **Next.js** and **Tailwind CSS**. The platform connects hospitals with nearby blood donors instantly, making the donation process faster and more efficient.

![Bloodlink Banner](https://via.placeholder.com/1200x400/D72638/FFFFFF?text=Bloodlink+Blood+Donor+Platform)

## 🌟 Features

### Design & UI
- **Modern & Clean Design** - Warm, minimal aesthetic avoiding clinical coldness
- **Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- **Custom Color Palette** - Crimson red, teal green, midnight blue, and amber
- **Smooth Animations** - Engaging hover effects and transitions
- **Accessibility Focused** - Semantic HTML and proper contrast ratios
- **Dark Mode Support** - Toggle between light and dark themes

### Authentication & User Management
- **JWT Authentication** - Secure login/logout with token refresh
- **Role-based Access** - Separate interfaces for donors and health centers
- **Protected Routes** - Authentication-required pages with automatic redirects
- **Profile Management** - Complete user profile editing and management
- **Password Management** - Change password functionality

### Core Pages & Features
1. **Landing Page** - Hero section, how it works, impact stats, and CTAs
2. **Authentication Pages** - Login and registration with role selection
3. **Profile Dashboard** - Role-specific profile management
4. **Health Centers Directory** - Searchable list of verified health centers
5. **Blood Request System** - Create and manage blood requests (health centers)
6. **How It Works** - Detailed explanation of the platform process
7. **About Page** - Mission, values, team, and company story

### Technical Features
- ⚡ **Next.js 15** - Latest stable version with App Router
- 🎨 **Tailwind CSS** - Utility-first styling with custom configuration
- 📱 **Mobile-First Design** - Responsive breakpoints and touch-friendly
- 🔧 **Component-Based Architecture** - Modular and maintainable code
- 🚀 **SEO Optimized** - Meta tags, OpenGraph, and semantic structure
- 🔐 **API Integration** - Axios-based API client with interceptors
- 🌙 **Dark Mode** - System preference detection with manual toggle

## 🎨 Brand Identity

### Color Palette
- **Primary (Crimson Red)**: `#D72638` - CTA buttons and highlights
- **Secondary (Off-White)**: `#F9F9F9` - Background sections
- **Dark (Midnight Blue)**: `#223843` - Headings and navigation
- **Info (Teal Green)**: `#2A9D8F` - Trust indicators and secondary CTAs
- **Warning (Amber)**: `#F4A261` - Status badges and highlights

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Secondary Font**: Poppins (Google Fonts)
- **Style**: Rounded sans-serif for warmth and accessibility

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Modern web browser
- Bloodlink Backend API running (see backend README)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bloodlink-frontend.git
   cd bloodlink-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   # Create environment file
   cp .env.example .env.local
   
   # Edit with your configuration
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
bloodlink-frontend/
├── app/
│   ├── about/                 # About page
│   ├── health-centers/        # Health centers directory
│   ├── how-it-works/         # How it works page
│   ├── login/                # Login page
│   ├── profile/              # User profile dashboard
│   ├── register/             # Registration page
│   ├── request/              # Blood request pages
│   ├── layout.js             # Root layout with metadata
│   └── page.js               # Landing page
├── components/
│   ├── Navbar.js             # Navigation header with auth
│   ├── HeroSection.js        # Main landing section
│   ├── HowItWorksSection.js  # Process explanation
│   ├── ImpactSection.js      # Statistics showcase
│   ├── CTASection.js         # Call to action
│   ├── Footer.js             # Site footer
│   ├── FormInput.js          # Reusable form input
│   └── Toast.js              # Notification component
├── contexts/
│   ├── AuthContext.js        # Authentication state management
│   └── ThemeContext.js       # Dark mode state management
├── lib/
│   └── api.js                # Axios API client with interceptors
├── styles/
│   └── globals.css           # Global styles & Tailwind
├── package.json              # Dependencies & scripts
├── tailwind.config.js        # Tailwind configuration
├── postcss.config.js         # PostCSS setup
└── next.config.js            # Next.js configuration
```

## 🔧 API Integration

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### API Client Features
- **Automatic Token Management** - Adds JWT tokens to requests
- **Token Refresh** - Handles expired tokens automatically
- **Request/Response Logging** - Development debugging
- **Error Handling** - Consistent error responses
- **Timeout Configuration** - 10-second request timeout

### Available API Modules
- `authAPI` - Authentication (login, register, refresh, logout)
- `usersAPI` - User profile management
- `donorsAPI` - Donor-specific operations
- `healthCentersAPI` - Health center operations
- `bloodRequestsAPI` - Blood request management

## 🔐 Authentication Flow

1. **Registration** - Users choose role (donor/health_center)
2. **Login** - JWT tokens stored in localStorage
3. **Token Refresh** - Automatic refresh on expiration
4. **Protected Routes** - Redirect to login if unauthenticated
5. **Role-based UI** - Different interfaces per user role

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: 1024px+
- **Large Desktop**: 1280px+

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📈 Performance Features

- **Optimized Images** - Next.js automatic optimization
- **Font Loading** - Preconnect to Google Fonts
- **CSS Purging** - Tailwind removes unused styles
- **Code Splitting** - Automatic route-based splitting
- **Static Generation** - Pre-rendered pages where possible

## 🎯 User Roles & Features

### Blood Donors
- Register with blood type and medical information
- Update availability status
- View donation history
- Receive blood request notifications
- Manage profile and contact preferences

### Health Centers
- Register with facility information
- Create urgent blood requests
- Search for available donors
- Manage verification status
- View request history and responses

## 🔧 Customization

### Colors
Edit the custom colors in `tailwind.config.js`:

```javascript
colors: {
  'crimson': '#D72638',
  'off-white': '#F9F9F9',
  'midnight': '#223843',
  'teal-green': '#2A9D8F',
  'amber': '#F4A261',
}
```

### Content
Update text content directly in component files:
- Hero headlines in `components/HeroSection.js`
- Statistics in `components/ImpactSection.js`
- Contact information in `components/Footer.js`

### Styling
Custom utility classes are defined in `styles/globals.css`:
- `.btn-primary` - Primary button styles
- `.btn-secondary` - Secondary button styles
- `.card-shadow` - Card shadow effects

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💡 Future Enhancements

- [ ] Progressive Web App (PWA) features
- [ ] Multi-language support
- [ ] Advanced animations with Framer Motion
- [ ] Integration with CMS for dynamic content
- [ ] Advanced accessibility features
- [ ] Real-time notifications with WebSockets
- [ ] Geolocation-based donor matching
- [ ] Mobile app development

## 🆘 Support

For support, email support@Bloodlink.org or join our Slack channel.

## 🚨 Emergency Contact

**24/7 Emergency Blood Hotline**: +1 (555) 911-BLOOD

---

Made with ❤️ for saving lives | © 2024 Bloodlink Blood Donor Platform
