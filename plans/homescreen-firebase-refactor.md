# HomeScreen Firebase Refactor Plan

## Current Status
- ✅ Enhanced LiveStreamDisplay data model created
- 🔄 Firestore collections setup in progress
- ⏳ HomeScreen refactoring pending

## Completed Work

### 1. Enhanced Data Models
**Created:** `/src/types/models/streamDisplay.ts`
- `StreamDisplay` interface with display-ready fields
- `FeaturedStream` interface for homepage curation
- `streamDisplayConverter` for type-safe Firestore operations
- `featuredStreamConverter` for featured streams

### Data Structure
```typescript
interface StreamDisplay {
  id: string;
  title: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  startTime: FirebaseFirestoreTypes.Timestamp;
  endTime?: FirebaseFirestoreTypes.Timestamp;
  status: 'scheduled' | 'live' | 'ended';
  productIds: string[];
  playbackUrl?: string;
  thumbnailUrl: string;
  viewers: number;
  category: string;
  currentBid?: number;
  productCount: number;
  isFeatured?: boolean;
}
```

## Remaining Tasks

### 2. Firestore Collections Setup
**Next Steps:**
- Create/populate Firestore collections: `liveStreams`, `users`, `featuredStreams`
- Add mock data migration script for demo content
- Set up Firestore security rules for read access

### 3. Firestore Converters
**Next Steps:**
- Update existing converters to handle display fields
- Create `streamMetricsConverter` for viewer counts
- Create `featuredStreamConverter` for homepage featured items

### 4. HomeScreen Refactoring
**Next Steps:**
- Replace mock data with Firestore queries using `onSnapshot`
- Add loading states and error handling
- Implement real-time updates
- Update category filtering to use Firestore queries

### 5. Testing & Polish
**Next Steps:**
- Test real-time updates
- Verify category filtering works
- Add pull-to-refresh with Firestore
- Performance optimization

## Files to Modify
- `/src/screens/Home/HomeScreen.tsx` - Main refactor
- `/src/services/firebase/firestore.ts` - Add new queries
- `/src/hooks/useFirestore.ts` - Add custom hooks
- `/src/config/firebase.config.ts` - Add collection constants

## Mock Data Migration
- Create migration script to populate Firestore
- Set up realistic demo data structure
- Include seller profiles and sample live streams

## Estimated Completion Time
**Remaining: ~2.5 hours** (was 3 hours total, 0.5 hours completed)

## Ready to Resume
When ready to continue, start with:
1. Firestore collections setup
2. Mock data population
3. HomeScreen component refactoring