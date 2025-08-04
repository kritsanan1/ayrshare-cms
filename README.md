# 🚀 Replit Master Prompt: Ayrshare CMS Development

## 📋 Project Overview
You are an expert full-stack developer creating a comprehensive Social Media Management System using Ayrshare API. This is a SaaS platform for Thai market with multi-language support (Thai/English).

## 🎯 Core Requirements

### **Application Type:** Full-Stack SaaS Web Application
### **Target Users:** Small to Medium Businesses, Digital Marketing Agencies, Content Creators
### **Primary Language:** Thai (with English fallback)
### **Monetization:** Subscription-based SaaS model

---

## 🛠️ Technical Stack

### **Frontend Framework**
```bash
# Primary: Next.js 14 with TypeScript
npm create-next-app@latest ayrshare-cms --typescript --tailwind --eslint --app
```

### **Backend & Database**
```bash
# Node.js + Express + Prisma + PostgreSQL
npm install express prisma @prisma/client bcryptjs jsonwebtoken
npm install -D @types/express @types/bcryptjs @types/jsonwebtoken
```

### **UI & Styling**
```bash
# TailwindCSS + HeadlessUI + Lucide Icons
npm install @headlessui/react @heroicons/react lucide-react
npm install react-hot-toast react-hook-form @hookform/resolvers zod
```

### **Additional Dependencies**
```bash
# State Management & Utils
npm install zustand axios date-fns clsx class-variance-authority

# Charts & Analytics
npm install recharts chart.js react-chartjs-2

# Payment Integration
npm install stripe @stripe/stripe-js

# Queue System
npm install bull redis ioredis

# Authentication
npm install next-auth @next-auth/prisma-adapter
```

---

## 📁 Project Structure

```
ayrshare-cms/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── api/               # API routes
│   │   ├── globals.css        # Global styles
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   │   ├── ui/               # UI components
│   │   ├── forms/            # Form components
│   │   ├── charts/           # Chart components
│   │   └── layout/           # Layout components
│   ├── lib/                  # Utility functions
│   │   ├── prisma.ts         # Database client
│   │   ├── auth.ts           # Authentication config
│   │   ├── ayrshare.ts       # Ayrshare API client
│   │   └── utils.ts          # Helper functions
│   ├── hooks/                # Custom React hooks
│   ├── store/                # Zustand stores
│   └── types/                # TypeScript types
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── public/                   # Static assets
└── docs/                     # Documentation
```

---

## 🗄️ Database Schema (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  fullName      String?
  avatar        String?
  planType      PlanType  @default(STARTER)
  status        UserStatus @default(ACTIVE)
  ayrshareApiKey String?
  
  // Subscription
  subscriptionId String?
  subscriptionStatus String?
  currentPeriodEnd DateTime?
  
  // Relations
  posts         Post[]
  socialAccounts SocialAccount[]
  teamMemberships TeamMember[]
  ownedTeams    Team[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@map("users")
}

model Team {
  id          String   @id @default(cuid())
  name        String
  description String?
  avatar      String?
  planLimits  Json?
  
  // Relations
  owner       User     @relation(fields: [ownerId], references: [id])
  ownerId     String
  members     TeamMember[]
  posts       Post[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("teams")
}

model TeamMember {
  id          String     @id @default(cuid())
  role        TeamRole   @default(MEMBER)
  permissions Json?
  
  // Relations
  user        User       @relation(fields: [userId], references: [id])
  userId      String
  team        Team       @relation(fields: [teamId], references: [id])
  teamId      String
  
  joinedAt    DateTime   @default(now())
  
  @@unique([userId, teamId])
  @@map("team_members")
}

model SocialAccount {
  id           String    @id @default(cuid())
  platform     Platform
  accountName  String
  accountId    String
  accessToken  String?
  refreshToken String?
  isActive     Boolean   @default(true)
  
  // Relations
  user         User      @relation(fields: [userId], references: [id])
  userId       String
  posts        PostPlatform[]
  
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  @@unique([userId, platform, accountId])
  @@map("social_accounts")
}

model Post {
  id              String      @id @default(cuid())
  content         String
  mediaUrls       String[]
  scheduledTime   DateTime?
  status          PostStatus  @default(DRAFT)
  ayrsharePostId  String?
  analyticsData   Json?
  
  // Relations
  author          User        @relation(fields: [authorId], references: [id])
  authorId        String
  team            Team?       @relation(fields: [teamId], references: [id])
  teamId          String?
  platforms       PostPlatform[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  publishedAt     DateTime?
  
  @@map("posts")
}

model PostPlatform {
  id              String        @id @default(cuid())
  platform        Platform
  status          PostStatus    @default(PENDING)
  platformPostId  String?
  errorMessage    String?
  
  // Relations
  post            Post          @relation(fields: [postId], references: [id])
  postId          String
  socialAccount   SocialAccount @relation(fields: [socialAccountId], references: [id])
  socialAccountId String
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@unique([postId, socialAccountId])
  @@map("post_platforms")
}

// Enums
enum PlanType {
  STARTER
  PROFESSIONAL
  ENTERPRISE
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum TeamRole {
  OWNER
  ADMIN
  EDITOR
  MEMBER
}

enum Platform {
  FACEBOOK
  INSTAGRAM
  TWITTER
  LINKEDIN
  TIKTOK
  YOUTUBE
  LINE
  PINTEREST
}

enum PostStatus {
  DRAFT
  SCHEDULED
  PENDING
  PUBLISHED
  FAILED
}
```

---

## 🔧 Core Services & APIs

### **1. Ayrshare Service**
```typescript
// lib/ayrshare.ts
export class AyrshareService {
  private apiKey: string;
  private baseURL = 'https://app.ayrshare.com/api';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createPost(data: CreatePostData): Promise<AyrshareResponse> {
    // Implementation
  }

  async getAnalytics(postId: string): Promise<AnalyticsData> {
    // Implementation  
  }

  async getProfiles(): Promise<ProfileData[]> {
    // Implementation
  }
}
```

### **2. API Routes Structure**
```typescript
// API Endpoints to implement:

// Authentication
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

// Posts Management
GET    /api/posts                    # List posts with pagination
POST   /api/posts                    # Create new post
GET    /api/posts/[id]               # Get specific post
PUT    /api/posts/[id]               # Update post
DELETE /api/posts/[id]               # Delete post
POST   /api/posts/[id]/publish       # Publish immediately
POST   /api/posts/[id]/schedule      # Schedule post

// Social Accounts
GET    /api/social-accounts          # List connected accounts
POST   /api/social-accounts          # Connect new account
DELETE /api/social-accounts/[id]     # Disconnect account
POST   /api/social-accounts/[id]/test # Test connection

// Analytics
GET    /api/analytics/overview       # Dashboard analytics
GET    /api/analytics/posts/[id]     # Post-specific analytics
GET    /api/analytics/accounts       # Account performance

// Teams (Professional+ plans)
GET    /api/teams                    # List user teams
POST   /api/teams                    # Create team
GET    /api/teams/[id]               # Get team details
PUT    /api/teams/[id]               # Update team
DELETE /api/teams/[id]               # Delete team
POST   /api/teams/[id]/members       # Add team member

// Billing & Subscriptions
GET    /api/billing/plans            # Available plans
POST   /api/billing/subscribe        # Create subscription
POST   /api/billing/portal           # Billing portal
POST   /api/webhooks/stripe          # Stripe webhooks
```

---

## 🎨 UI/UX Requirements

### **Design System**
- **Colors:** Blue-based palette for trust, Orange accents for CTAs
- **Typography:** Inter font family
- **Components:** Consistent spacing (4px grid system)
- **Responsive:** Mobile-first approach
- **Dark Mode:** Support for light/dark themes

### **Key Pages & Components**

#### **1. Authentication Pages**
- Login/Register with email + password
- Social login (Google, Facebook)
- Forgot password flow
- Email verification

#### **2. Dashboard Layout**
```typescript
// Main dashboard sections:
- Sidebar Navigation
- Top Header (user menu, notifications)
- Main Content Area
- Quick Action Buttons
- Recent Activity Feed
```

#### **3. Post Composer**
- Rich text editor
- Media upload (drag & drop)
- Platform selector (checkboxes)
- Schedule picker (date/time)
- Preview functionality
- Save as draft option

#### **4. Posts Management**
- Filterable list (status, platform, date)
- Bulk actions
- Post analytics preview
- Edit/Delete/Duplicate actions

#### **5. Analytics Dashboard**
- Overview metrics cards
- Charts (line, bar, pie)
- Date range picker
- Export functionality

#### **6. Settings Pages**
- Profile management
- Connected accounts
- Billing & subscription
- Team management
- API keys

---

## 🔐 Authentication & Security

### **NextAuth.js Configuration**
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
  providers: [
    CredentialsProvider({
      // Email/password authentication
    }),
    GoogleProvider({
      // Google OAuth
    })
  ],
  callbacks: {
    // JWT & session callbacks
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register'
  }
}
```

### **Security Features**
- JWT tokens with refresh mechanism
- Rate limiting (100 requests/minute per user)
- Input validation with Zod schemas
- CORS configuration
- Environment variables for secrets
- Password hashing with bcrypt

---

## 💰 Payment Integration

### **Stripe Configuration**
```typescript
// Support for Thai payment methods:
- Credit/Debit Cards
- PromptPay
- TrueMoney Wallet
- Internet Banking

// Subscription tiers:
STARTER: ฿299/month
PROFESSIONAL: ฿899/month  
ENTERPRISE: ฿2,499/month
```

---

## 📊 Analytics & Monitoring

### **Key Metrics to Track**
- Monthly Recurring Revenue (MRR)
- User acquisition & churn
- Feature adoption rates
- API usage patterns
- Post performance metrics

### **Implementation**
- Server-side analytics with Prisma
- Client-side tracking (optional)
- Error monitoring with Sentry
- Performance monitoring

---

## 🌐 Internationalization

### **Language Support**
```typescript
// Primary: Thai (th)
// Fallback: English (en)

// Use next-intl for translations:
const translations = {
  th: {
    nav: {
      dashboard: 'แดชบอร์ด',
      posts: 'โพสต์',
      analytics: 'วิเคราะห์',
      settings: 'ตั้งค่า'
    }
  },
  en: {
    nav: {
      dashboard: 'Dashboard',
      posts: 'Posts', 
      analytics: 'Analytics',
      settings: 'Settings'
    }
  }
}
```

---

## 🚀 Deployment & DevOps

### **Environment Setup**
```bash
# Environment Variables
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://..."
AYRSHARE_API_KEY="..."
STRIPE_PUBLIC_KEY="..."
STRIPE_SECRET_KEY="..."
REDIS_URL="..."
```

### **Replit Configuration**
```toml
# .replit
[deployment]
run = "npm run build && npm start"
deploymentTarget = "cloudrun"

[[ports]]
localPort = 3000
externalPort = 80
```

---

## 📝 Development Guidelines

### **Code Quality**
- TypeScript for type safety
- ESLint + Prettier for formatting
- Husky for pre-commit hooks
- Consistent naming conventions
- Comprehensive error handling

### **Testing Strategy**
- Unit tests with Jest
- Integration tests for API routes
- E2E tests with Playwright
- Component testing with React Testing Library

### **Performance Optimization**
- Image optimization with Next.js
- Code splitting and lazy loading
- Database query optimization
- Caching strategies (Redis)
- CDN for static assets

### **Thai Market Specific Features**
- Thai language support throughout
- Local payment methods (PromptPay, TrueMoney)
- Thai timezone handling
- Local customer support
- Integration with popular Thai platforms

---

## 🎯 Success Metrics & KPIs

### **Technical KPIs**
- Page load time < 2 seconds
- API response time < 500ms
- 99.9% uptime
- Zero critical security vulnerabilities

### **Business KPIs**
- User acquisition cost < ฿200
- Monthly churn rate < 5%
- Customer lifetime value > ฿10,000
- Net Promoter Score > 50

---

## 📚 Documentation Requirements

### **Developer Documentation** 
- API documentation (OpenAPI/Swagger)
- Database schema documentation
- Deployment guides
- Contributing guidelines

### **User Documentation**
- User onboarding guide
- Feature tutorials (video + text)
- FAQ section
- Troubleshooting guides

---

## 🔄 Phase-by-Phase Implementation

### **Phase 1: Core MVP (Month 1-2)**
1. Authentication system
2. Basic post creation & publishing
3. Ayrshare API integration
4. Simple dashboard
5. Payment integration

### **Phase 2: Enhanced Features (Month 3-4)**
1. Post scheduling
2. Analytics dashboard
3. Team collaboration
4. Mobile responsiveness
5. Performance optimization

### **Phase 3: Advanced Features (Month 5-6)**
1. Advanced analytics
2. Content templates
3. Bulk operations
4. White-label options
5. Mobile app (React Native)

---

## 🎨 Brand Guidelines

### **Logo & Colors**
- Primary: #0066CC (Blue)
- Secondary: #FF6B35 (Orange)
- Success: #10B981 (Green)
- Warning: #F59E0B (Yellow)
- Error: #EF4444 (Red)

### **Tone of Voice**
- Professional yet friendly
- Clear and concise
- Supportive and helpful
- Localized for Thai audience

---

## ⚡ Quick Start Commands

```bash
# Initialize project
npx create-next-app@latest ayrshare-cms --typescript --tailwind --eslint

# Install dependencies
npm install prisma @prisma/client bcryptjs jsonwebtoken express

# Setup database
npx prisma init
npx prisma generate
npx prisma db push

# Development
npm run dev

# Build & Deploy
npm run build
npm start
```

---

**Remember:** Focus on creating a production-ready, scalable SaaS application that serves the Thai market effectively while maintaining international standards for code quality and user experience.