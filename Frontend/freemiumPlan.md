# Freemium Model Implementation Plan

## Overview
Implementation plan for adding a two-tier subscription model: Free and Premium.

## Free Tier Limitations

### Hard Limits
- **Clients**: Maximum 1 client
- **Categories**: Maximum 1 category  
- **Products**: Maximum 1 product
- **Invoices**: Maximum 3 invoices per month (resets monthly, deletions don't free up quota)
- **Templates**: No template creation allowed (feature completely disabled)
- **Watermark**: All invoices include a watermark on PDF exports

### Premium Tier Benefits
- **Unlimited** clients, categories, products, invoices
- **Template creation** enabled
- **No watermark** on PDFs
- **All future premium features**

---

## Implementation Steps

### 1. Database Schema Changes

#### Add Subscription Model
```prisma
model User {
  // ...existing fields...
  subscriptionTier  String   @default("free") // "free" or "premium"
  subscriptionStart DateTime @default(now())
  subscriptionEnd   DateTime? // null for free tier
}

model InvoiceQuota {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  month           String   // format: "YYYY-MM"
  invoicesCreated Int      @default(0)
  createdAt       DateTime @default(now())
  
  @@unique([userId, month])
}
```

#### Migration Plan
- Add new fields to User model
- Create InvoiceQuota tracking table
- Set all existing users to "premium" temporarily (grandfather them in)
- Create script to initialize quota records

---

### 2. Backend Services Layer

#### Create Subscription Service (`lib/subscriptionService.ts`)
```typescript
class SubscriptionService {
  // Check if user is premium
  async isPremium(userId: string): Promise<boolean>
  
  // Get current tier
  async getUserTier(userId: string): Promise<'free' | 'premium'>
  
  // Check specific limits
  async canCreateClient(userId: string): Promise<boolean>
  async canCreateCategory(userId: string): Promise<boolean>
  async canCreateProduct(userId: string): Promise<boolean>
  async canCreateInvoice(userId: string): Promise<boolean>
  async canCreateTemplate(userId: string): Promise<boolean>
  
  // Get usage stats
  async getUsageStats(userId: string): Promise<UsageStats>
  
  // Quota management
  async incrementInvoiceQuota(userId: string): Promise<void>
  async getCurrentMonthQuota(userId: string): Promise<number>
}
```

#### Create Quota Tracking Service (`lib/quotaService.ts`)
```typescript
class QuotaService {
  // Track invoice creation (called on every invoice create)
  async recordInvoiceCreation(userId: string): Promise<void>
  
  // Get current month's invoice count
  async getMonthlyInvoiceCount(userId: string): Promise<number>
  
  // Reset monthly quotas (scheduled job)
  async resetMonthlyQuotas(): Promise<void>
}
```

---

### 3. API Route Modifications

#### Protect All Creation Endpoints

**`/api/clients` (POST)**
- Check `canCreateClient()` before creating
- Return 403 with appropriate message if limit reached

**`/api/categories` (POST)**
- Check `canCreateCategory()` before creating
- Return 403 with appropriate message if limit reached

**`/api/products` (POST)**
- Check `canCreateProduct()` before creating
- Return 403 with appropriate message if limit reached

**`/api/invoices` (POST)**
- Check `canCreateInvoice()` before creating
- Increment quota on successful creation
- Return 403 with appropriate message if limit reached

**`/api/invoices/[id]` (DELETE)**
- Allow deletion but **DO NOT** decrement quota
- Add comment explaining quota isn't freed

**`/api/templates` (POST)**
- Check `canCreateTemplate()` (always false for free users)
- Return 403 for free tier users

---

### 4. PDF Generation Changes

#### Modify PDF Service (`lib/pdfService.ts`)
```typescript
async function generateInvoicePDF(invoice: Invoice, user: User) {
  const isPremium = await subscriptionService.isPremium(user.id);
  
  // Generate PDF
  const pdfDoc = await PDFDocument.create();
  
  // ... existing PDF generation code ...
  
  // Add watermark for free users
  if (!isPremium) {
    await addWatermark(pdfDoc, "CREATED WITH FREE TIER");
  }
  
  return pdfDoc.save();
}

async function addWatermark(pdfDoc: PDFDocument, text: string) {
  // Add diagonal watermark across all pages
  // Use semi-transparent text
  // Position: center of page, rotated 45 degrees
}
```

---

### 5. Frontend Components

#### Create Usage Dashboard Component (`components/UsageDashboard.tsx`)
Shows current usage for free tier users:
- Clients: 1/1
- Categories: 1/1  
- Products: 1/1
- Invoices this month: X/3
- Big "Upgrade to Premium" button

#### Create Limit Warning Components
- `LimitReachedModal.tsx` - Modal when user hits a limit
- `UpgradePrompt.tsx` - Inline upgrade prompts
- `UsageBadge.tsx` - Small badge showing usage (e.g., "2/3 invoices")

#### Modify Existing Pages

**Dashboard (`app/dashboard/page.tsx`)**
- Show UsageDashboard for free users at top
- Add tier badge next to username

**Clients List (`app/clients/page.tsx`)**
- Disable "New Client" button if limit reached
- Show limit warning

**Categories Page**
- Disable "New Category" button if limit reached
- Show limit warning

**Products Page**
- Disable "New Product" button if limit reached
- Show limit warning

**Invoices Page**
- Show monthly quota usage
- Disable "New Invoice" button if limit reached
- Show "Resets on [date]" message

**Templates Page**
- Show "Premium Feature" banner for free users
- Completely hide creation UI

---

### 6. Middleware & Guards

#### Create Subscription Middleware (`middleware/subscription.ts`)
- Attach subscription info to request
- Make available to all API routes
- Cache user tier for performance

#### Create Frontend Hooks
```typescript
// hooks/useSubscription.ts
function useSubscription() {
  const { data: tier } = useSWR('/api/user/subscription');
  const { data: usage } = useSWR('/api/user/usage');
  
  return {
    isPremium: tier === 'premium',
    tier,
    usage,
    canCreate: {
      client: usage?.clients < limits.free.clients || tier === 'premium',
      category: usage?.categories < limits.free.categories || tier === 'premium',
      product: usage?.products < limits.free.products || tier === 'premium',
      invoice: usage?.invoicesThisMonth < limits.free.invoices || tier === 'premium',
      template: tier === 'premium'
    }
  };
}
```

---

### 7. New API Endpoints

**`/api/user/subscription` (GET)**
- Returns user's subscription tier and dates

**`/api/user/usage` (GET)**
- Returns current usage stats for all resources
- Returns limits based on tier

**`/api/upgrade` (POST)** _(Future - Payment Integration)_
- Handle upgrade to premium
- Integrate with payment provider (Stripe/Paddle)

---

### 8. Database Queries Optimization

#### Add Counting Queries
```typescript
// Count user's resources efficiently
const counts = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    _count: {
      select: {
        clients: true,
        categories: true,
        products: true,
        invoices: true,
        templates: true
      }
    }
  }
});
```

---

### 9. Scheduled Jobs

#### Monthly Quota Reset
- Cron job that runs on 1st of each month
- Resets all InvoiceQuota records (or archives them)
- Could use Vercel Cron or external scheduler

```typescript
// app/api/cron/reset-quotas/route.ts
export async function GET(request: Request) {
  // Verify cron secret
  // Reset all monthly quotas
  // Return success
}
```

---

### 10. Testing Strategy

#### Unit Tests
- Test subscription service methods
- Test quota tracking
- Test limit checking logic

#### Integration Tests
- Test API endpoints respect limits
- Test quota increments correctly
- Test deletions don't free quota
- Test watermark appears on free tier PDFs

#### Manual Testing Checklist
- [ ] Create user with free tier
- [ ] Attempt to create 2nd client (should fail)
- [ ] Create 3 invoices (should succeed)
- [ ] Attempt 4th invoice (should fail)
- [ ] Delete 1 invoice, attempt to create new one (should fail)
- [ ] Export invoice PDF, verify watermark appears
- [ ] Upgrade to premium
- [ ] Verify all limits removed
- [ ] Verify watermark removed from PDFs
- [ ] Create template (should work)

---

### 11. UI/UX Considerations

#### Visual Indicators
- Badge on navigation showing tier
- Progress bars for usage
- Grayed-out buttons when limits reached
- Tooltips explaining limits

#### Messaging
- Clear, friendly error messages
- Emphasize value of premium
- Show what they'll unlock

#### Upgrade Flow
- Prominent upgrade buttons
- Comparison table (Free vs Premium)
- Testimonials or social proof
- Clear pricing

---

### 12. Migration Path for Existing Users

#### Option A: Grandfather Existing Users
- All current users get premium for free
- Only new signups start on free tier

#### Option B: Grace Period
- Give existing users 30 days premium
- Auto-downgrade after grace period

#### Option C: Forced Migration
- Evaluate each user's usage
- Downgrade if under limits
- Keep premium if over limits

---

### 13. Configuration

#### Create Config File (`lib/config/subscription.ts`)
```typescript
export const SUBSCRIPTION_LIMITS = {
  free: {
    clients: 1,
    categories: 1,
    products: 1,
    invoicesPerMonth: 3,
    templates: 0
  },
  premium: {
    clients: Infinity,
    categories: Infinity,
    products: Infinity,
    invoicesPerMonth: Infinity,
    templates: Infinity
  }
};

export const WATERMARK_CONFIG = {
  text: 'CREATED WITH FREE TIER',
  opacity: 0.1,
  fontSize: 48,
  rotation: 45,
  color: '#000000'
};
```

---

### 14. Future Enhancements

#### Potential Additional Premium Features
- Custom branding/colors
- Email invoice sending
- Multiple users/team members
- Advanced reporting/analytics
- API access
- White-label option
- Priority support

#### Potential Additional Tiers
- **Starter**: Increase limits slightly (5 clients, 10 invoices/month)
- **Professional**: Current premium features
- **Business**: Add team features, API access

---

## Implementation Order

### Phase 1: Foundation (Week 1)
1. Database schema changes
2. Subscription service implementation
3. Quota tracking service
4. Configuration setup

### Phase 2: Backend Protection (Week 1-2)
1. Modify all API routes
2. Add middleware
3. Create new API endpoints
4. Write unit tests

### Phase 3: Frontend Updates (Week 2)
1. Create usage dashboard
2. Create limit warning components
3. Modify existing pages
4. Create hooks

### Phase 4: PDF Watermark (Week 2)
1. Implement watermark logic
2. Test PDF generation
3. Verify appearance across different invoice types

### Phase 5: Testing & Polish (Week 3)
1. Integration testing
2. Manual testing
3. UI polish
4. Documentation

### Phase 6: Migration (Week 3)
1. Decide on migration strategy
2. Migrate existing users
3. Monitor for issues

### Phase 7: Launch (Week 4)
1. Deploy to production
2. Monitor metrics
3. Gather user feedback
4. Iterate

---

## Success Metrics

### Track These KPIs
- Free tier signup rate
- Conversion rate (free → premium)
- Time to upgrade (average days)
- Feature usage by tier
- Limit hit rate (how often users hit limits)
- Churn rate by tier

---

## Risks & Mitigation

### Risk 1: Users Gaming the System
**Mitigation**: Strict email verification, rate limiting, IP tracking

### Risk 2: Premium Features Not Compelling Enough
**Mitigation**: A/B test limits, gather feedback, add more premium features

### Risk 3: Technical Issues with Quota Tracking
**Mitigation**: Comprehensive testing, monitoring, rollback plan

### Risk 4: User Backlash from Existing Users
**Mitigation**: Clear communication, grandfather period, value emphasis

---

## Notes
- Start with conservative limits, can always relax them
- Monitor user behavior closely in first month
- Be ready to adjust limits based on data
- Consider soft launches (beta users only)
- Have clear upgrade path and messaging ready before launch