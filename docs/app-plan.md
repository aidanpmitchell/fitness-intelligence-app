# Fitness Intelligence App – Full System Plan

## 1. Overview

This project is a personal fitness intelligence app designed to:
- Track bodyweight, calories, macros, and lifestyle data
- Aggregate data from multiple sources (manual, Apple Health, MyFitnessPal)
- Generate insights such as maintenance calories and progress trends
- Provide weekly check-ins and goal adjustments

This is a **mobile-first + web-supported application**.

---

## 2. Core Goal

The app should answer:

- Am I progressing toward my goal?
- What is my true maintenance calorie level?
- Should I adjust calories next week?
- Are sleep, steps, or activity affecting results?
- Is my performance improving or declining?

---

## 3. Architecture Overview

### Frontend
- Web: Next.js
- Mobile: Expo / React Native

### Backend
- Supabase (Postgres + Auth + API)

### Data Sources
- Manual entry (weight, calories)
- Apple Health (steps, sleep, workouts)
- MyFitnessPal (nutrition, optional)

### Shared Logic
- Located in `packages/shared`
- Handles:
  - trend weight
  - maintenance estimation
  - weekly check-ins
  - macro calculations

---

## 4. Core Features (MVP)

### 4.1 Daily Logging
- Bodyweight
- Calories
- Macros
- Notes

### 4.2 Dashboard Summary
- Latest weight
- Average calories
- Total logs

### 4.3 Weekly Check-In
- Avg weight
- Avg calories
- Rate of change
- Maintenance estimate
- New calorie target

---

## 5. Data Model

### daily_logs
- id
- log_date
- body_weight
- calories
- protein_g
- carbs_g
- fat_g
- notes

### weekly_checkins (future)
- avg_weight
- avg_calories
- rate_of_change
- maintenance_estimate
- recommended_calories

---

## 6. Feature Development Workflow

Every feature follows:

1. Define feature (WHAT)
2. Define scope (MVP only)
3. Break into parts:
   - UI
   - Data
   - Logic
4. Implement with Codex
5. Test
6. Commit

---

## 7. Dashboard Strategy

### Web
- Built with Recharts
- Used for full analytics and charts

### Mobile
- Start with simple cards
- Add charts later (react-native-svg)

### Important Principle
Charts DO NOT contain logic.

All calculations live in shared functions:
- computeTrendWeight
- computeAverageCalories
- estimateMaintenance

---

## 8. Future Features

### Phase 2
- Apple Health integration
- Steps + sleep tracking
- Adherence scoring

### Phase 3
- Trend weight smoothing
- Smart calorie adjustments
- Performance tracking

### Phase 4
- Smart scale integration
- Advanced insights
- Notifications

---

## 9. Non-Goals (for now)

- Food database
- Barcode scanner
- Social features
- Full workout tracking (Liftoff handles this)

---

## 10. Key Principles

- Keep features small and incremental
- Build intelligence layer, not tracking tools
- Prioritize usability over complexity
- Separate logic from UI
- Test every feature immediately

---

## 11. Current Progress

- [x] Repo setup
- [x] Supabase connected
- [x] daily_logs table created
- [x] Insert + fetch working
- [x] Basic UI form built
- [ ] Dashboard summary
- [ ] Trend weight
- [ ] Weekly check-in

---

## 12. Next Feature

Dashboard Summary:
- Latest weight
- Average calories
- Total logs
