# Database Migration Guide for Freemium Feature

## Step 1: Create Migration

In the `/Backend` directory, run:

```bash
cd /Users/zavros/Documents/GitHub/InvoicingSystemProduction/Backend
dotnet ef migrations add AddFreemiumSupport
```

This will create a new migration that adds:
1. `SubscriptionTier` column to the `Users` table (default: "free")
2. Creates the `InvoiceQuotas` table with columns:
   - `Id` (int, primary key)
   - `UserId` (int, foreign key to Users)
   - `Month` (string, format: "YYYY-MM")
   - `InvoicesCreated` (int, default: 0)
   - `DateEntered`, `EnteredBy`, `DateModified`, `ModifiedBy`, `IsDeleted` (inherited from BaseEntity)
3. Unique index on `(UserId, Month)` in InvoiceQuotas table

## Step 2: Review the Migration

Check the generated migration file in `Backend/Migrations/` to ensure it looks correct.

## Step 3: Apply Migration to Database

```bash
dotnet ef database update
```

## Step 4: Set Existing Users to Premium (Optional but Recommended)

To grandfather in existing users, you can run this SQL directly on your database:

```sql
UPDATE "Users" 
SET "SubscriptionTier" = 'premium' 
WHERE "SubscriptionTier" = 'free' OR "SubscriptionTier" IS NULL;
```

This ensures existing users won't be limited by the new restrictions.

## Step 5: Verify

Check that the migration worked:

```sql
-- Check Users table has the new column
SELECT "Id", "Email", "SubscriptionTier" FROM "Users" LIMIT 5;

-- Check InvoiceQuotas table exists
SELECT * FROM "InvoiceQuotas" LIMIT 5;
```

## Troubleshooting

If you get migration errors:

1. **"Column already exists"** - Drop the column manually or remove from migration
2. **"Table already exists"** - Drop the table manually or remove from migration  
3. **Build errors** - Make sure all backend files compile: `dotnet build`

## Notes

- New users registering after this migration will automatically be on the "free" tier
- Existing users should be upgraded to "premium" to avoid disruption
- The InvoiceQuotas table will populate automatically as free users create invoices
