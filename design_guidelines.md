# Design Guidelines: KOL Prediction Market Platform

## Design Approach
**Reference-Based Approach** drawing inspiration from modern crypto trading platforms (Coinbase, Robinhood) combined with betting interfaces (klout.bet) and clean data presentation (Linear, Stripe). The platform requires a balance of excitement (betting) and trust (financial transactions) with real-time data clarity.

## Core Design Principles
1. **Data Clarity First**: Numbers, odds, and metrics must be instantly readable
2. **Real-Time Energy**: Visual cues for live updates without overwhelming users
3. **Trust Through Minimalism**: Clean, professional aesthetic builds credibility
4. **Gamification Balance**: Engaging without feeling gimmicky

## Color Palette

**Dark Mode Primary** (crypto/trading standard):
- Background: 220 20% 10% (deep blue-grey)
- Surface: 220 15% 15% (elevated cards)
- Border: 220 10% 25% (subtle divisions)

**Brand Colors**:
- Primary: 270 80% 60% (vibrant purple - betting excitement)
- Success/Win: 150 70% 50% (mint green)
- Loss/Danger: 0 75% 60% (coral red)
- Warning: 45 90% 55% (amber)

**Text**:
- Primary: 0 0% 98%
- Secondary: 0 0% 65%
- Muted: 0 0% 45%

## Typography

**Font Stack**:
- Primary: Inter (via Google Fonts) - excellent for data/numbers
- Display: Space Grotesk (via Google Fonts) - bold headers, KOL names

**Scale**:
- Hero/Display: text-5xl to text-6xl, font-bold
- Section Headers: text-2xl to text-3xl, font-semibold
- KOL Names: text-xl, font-medium
- Body: text-base, font-normal
- Metrics/Numbers: text-lg to text-2xl, font-semibold (tabular-nums for alignment)
- Small Data: text-sm, font-medium

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Tight spacing: p-2, gap-2 (within cards)
- Standard: p-4, gap-4, m-6 (component padding)
- Generous: p-8, py-12, gap-8 (section spacing)
- Large: py-16, py-24 (page sections)

**Grid System**:
- Dashboard: 12-column responsive grid
- KOL Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Leaderboard: Single column with data table
- Live Feed: 2-column split (feed + betting panel)

## Component Library

**Navigation**:
- Fixed top navbar with logo, wallet balance, user menu
- Dark background (220 20% 12%) with subtle border-b
- Primary CTA button for "Place Bet" or "Connect Wallet"

**KOL Profile Cards**:
- Elevated surface with hover lift effect
- Avatar (rounded-full, 64px)
- Name, tier badge, key metrics (followers, engagement rate)
- Trending indicator (up/down arrow with percentage)
- Mini sparkline chart showing recent performance
- Quick bet button

**Betting Interface**:
- Modal overlay with blurred backdrop
- Odds display with large, bold numbers
- Bet amount input with preset chips ($10, $50, $100, $500)
- Potential payout calculator (real-time)
- "Confirm Bet" prominent button
- Risk warning in muted text

**Live Feed**:
- Chronological list of recent bets/outcomes
- Each entry: timestamp, user, KOL, bet type, amount, status
- Color-coded by outcome (green wins, red losses, grey pending)
- Auto-scroll with "New Bet" notification badges

**Data Tables (Leaderboards)**:
- Sticky header row
- Alternating row backgrounds for readability
- Rank badges (gold/silver/bronze for top 3)
- Sortable columns
- User's row highlighted if in view

**Charts & Visualizations**:
- Line charts for KOL performance trends (using Chart.js or Recharts)
- Color: Primary purple with gradient fill
- Grid lines: subtle, muted color
- Tooltips on hover with precise data points

**Wallet Panel**:
- Balance display (large, prominent)
- Deposit/Withdraw buttons
- Transaction history dropdown
- Quick stats: Today's P&L, Win Rate, Total Bets

**Status Indicators**:
- Live pulse animation (green dot) for real-time updates
- Badge components for bet status: Pending, Won, Lost, Settled
- Loading skeletons for data fetching states

## Interactions

**Micro-interactions**:
- Hover states: subtle scale (scale-105) and shadow increase
- Button clicks: slight scale down (scale-95) feedback
- Success animations: confetti or checkmark for wins (use Lottie if available)
- Number changes: brief highlight flash (yellow) when odds/metrics update

**Transitions**:
- Modal entrance: fade-in with slight scale-up (duration-200)
- Page navigation: smooth fade transitions
- Data refresh: shimmer loading effect

## Images

**Hero Section**:
- Full-width background image showing energized crowd or abstract data visualization
- Overlay gradient: from transparent to background color (bottom)
- Centered headline and CTA over image
- Height: 60vh on desktop, 50vh on mobile

**KOL Avatars**:
- Placeholder: Use consistent avatar service (UI Avatars or DiceBear)
- Border: ring-2 ring-primary for featured KOLs

**Empty States**:
- Illustration placeholder for "No bets yet" or "No KOLs found"
- Muted colors, friendly tone

## Accessibility

- All interactive elements: minimum 44px touch target
- Focus states: ring-2 ring-primary ring-offset-2 ring-offset-background
- ARIA labels for icon-only buttons
- Color contrast: minimum WCAG AA (4.5:1 for text)
- Keyboard navigation: tab order follows visual hierarchy

## Responsive Behavior

- Mobile: Single-column stack, full-width cards
- Tablet: 2-column grids, collapsible sidebar
- Desktop: Full grid layouts, persistent sidebars, multi-panel views
- Breakpoints: sm: 640px, md: 768px, lg: 1024px, xl: 1280px

## Page Structure

**Landing/Marketing Page**:
1. Hero: Bold headline "Bet on Influence" with background image, primary CTA
2. How It Works: 3-column feature grid with icons
3. Top KOLs Preview: Carousel of trending KOLs
4. Live Stats: Real-time counter of bets placed, total volume
5. Leaderboard Teaser: Top 5 winners this week
6. CTA Section: "Start Betting Now" with wallet connect
7. Footer: Links, socials, disclaimer

**Dashboard** (Post-Login):
- Top: Balance, quick stats, notifications
- Main: 3-column grid of KOL cards with filters
- Sidebar: Live bet feed, quick bet panel
- Bottom: My Active Bets section

This design creates a trustworthy, energetic platform that balances the excitement of betting with the professionalism required for financial transactions.