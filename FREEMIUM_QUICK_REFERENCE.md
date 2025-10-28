# ⚡ Freemium Quick Reference Card

## 🎯 System Overview
**Free Tier**: 1 client, 1 category, 1 product, 3 invoices/month, 0 templates  
**Premium Tier**: Unlimited everything  
**Enforcement**: Both frontend (modal) and backend (403 error)

---

## 🗄️ STEP 1: Database Migration (REQUIRED!)

```bash
cd Backend
dotnet ef migrations add AddFreemiumSupport
dotnet ef database update

# Optional: Set existing users to premium
# UPDATE "Users" SET "SubscriptionTier" = 'premium';
```

---

## 🔧 STEP 2: Remaining Frontend Work

### Find & Update These Components:

**1. Category Creation** (likely in ProductCatalogPage)
```bash
grep -r "createCategory" Frontend/src/
```

**2. Template Creation** (likely in InvoiceTemplatesPage)
```bash
grep -r "createTemplate" Frontend/src/
```

### For Each Component, Add This Code:

```jsx
// 1. Add imports at top
import { useLimit } from '../../utils/useLimit';
import LimitReachedModal from '../SubscriptionPage/LimitReachedModal';

// 2. Add hook in component
const { checkLimit, limitModalOpen, limitModalResource, closeLimitModal } = useLimit();

// 3. Check limit before creating
const handleCreate = async () => {
  const canCreate = checkLimit('category'); // or 'template'
  if (!canCreate) return;
  
  try {
    await createAPI(formData);
  } catch (error) {
    if (error.response?.status === 403 && error.response?.data?.limitReached) {
      // Show error message
    }
  }
};

// 4. Add modal before closing component tag
<LimitReachedModal
  open={limitModalOpen}
  onClose={closeLimitModal}
  resource={limitModalResource}
/>
```

---

## 🎨 STEP 3: UI Enhancements

### A. Dashboard (DashboardPage.jsx)
```jsx
import UsageDashboard from '../components/SubscriptionPage/UsageDashboard';

// Add near top of dashboard
<UsageDashboard />
```

### B. Navigation/Header
```jsx
import TierBadge from '../components/SubscriptionPage/TierBadge';

// Add to header/nav
<TierBadge showUpgradeButton={true} />
```

### C. Subscription Page (SubscriptionPage.jsx)
- Show UsageDashboard
- Display upgrade options
- Update messaging (no trial required anymore)

---

## 🧪 Testing Commands

### Test as Free User:
1. Create account or set tier: `UPDATE "Users" SET "SubscriptionTier" = 'free' WHERE "Email" = 'test@email.com';`
2. Try creating 2 clients (2nd should fail)
3. Try creating 4 invoices (4th should fail)
4. Try creating template (should fail - premium only)

### Test as Premium User:
1. Set tier: `UPDATE "Users" SET "SubscriptionTier" = 'premium' WHERE "Email" = 'test@email.com';`
2. Create unlimited resources (all should work)

### Test API Directly:
```bash
TOKEN="your-jwt-token"

# Get tier
curl -H "Authorization: Bearer $TOKEN" http://localhost:5088/api/subscription/tier

# Get usage
curl -H "Authorization: Bearer $TOKEN" http://localhost:5088/api/subscription/usage

# Check if can create client
curl -H "Authorization: Bearer $TOKEN" http://localhost:5088/api/subscription/can-create/client
```

---

## 📊 Limits Reference

| Resource   | Free Tier | Premium |
|------------|-----------|---------|
| Clients    | 1         | ∞       |
| Categories | 1         | ∞       |
| Products   | 1         | ∞       |
| Invoices   | 3/month   | ∞       |
| Templates  | 0         | ∞       |

---

## 🔍 Troubleshooting

### Problem: Modal not showing
**Fix**: Check browser console, verify `useLimit` hook is imported

### Problem: Backend returns 500 instead of 403
**Fix**: Check migration ran, verify `SubscriptionTier` column exists

### Problem: Everyone has unlimited access
**Fix**: Check `SubscriptionContext` is loading tier correctly

### Problem: Usage stats not updating
**Fix**: Call `refreshStatus()` from `useSubscription` hook after creation

---

## 📁 Key Files to Know

### Backend:
- Limits config: `Backend/Utils/SubscriptionLimits.cs`
- Service: `Backend/Services/SubscriptionService.cs`
- Controllers: `Backend/Controllers/*Controller.cs`

### Frontend:
- Context: `Frontend/src/utils/SubscriptionContext.jsx`
- Hook: `Frontend/src/utils/useLimit.js`
- Components: `Frontend/src/components/SubscriptionPage/*.jsx`

---

## ✅ Completion Checklist

- [ ] Backend migration completed
- [ ] Category creation protected
- [ ] Template creation protected  
- [ ] Dashboard shows usage stats
- [ ] Navigation shows tier badge
- [ ] Subscription page updated
- [ ] Tested as free user
- [ ] Tested as premium user
- [ ] All modals show correctly
- [ ] API returns 403 for limits
- [ ] Frontend shows modals for limits

---

## 🎉 You're Done When...

1. ✅ Free user can create 1 client, hits modal on 2nd
2. ✅ Free user can create 3 invoices/month, hits modal on 4th
3. ✅ Free user cannot create templates (premium-only modal)
4. ✅ Premium user has no restrictions
5. ✅ Usage dashboard shows correct counts
6. ✅ Tier badge shows correct status
7. ✅ All upgrade buttons go to /subscription page

---

**Need help? Check:**
- `FREEMIUM_COMPLETE_SUMMARY.md` - Full details
- `Backend/FREEMIUM_IMPLEMENTATION_PROGRESS.md` - Backend specifics
- `Frontend/FREEMIUM_FRONTEND_GUIDE.md` - Frontend specifics
