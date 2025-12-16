# Amber - Project TODOs

## Phase 1: Foundation (MVP)

### Setup
- [x] Initialize SvelteKit project with pnpm
- [x] Configure Cloudflare adapter for SvelteKit
- [x] Set up Cloudflare Worker project (wrangler)
- [x] Create D1 database and initial migrations
- [x] Configure R2 bucket bindings
- [ ] Set up Heartwood auth integration *(pending credentials)*

### Database Schema
- [x] Create `user_storage` table (quotas, usage tracking)
- [x] Create `storage_files` table (file metadata)
- [x] Create `storage_addons` table (purchased add-ons)
- [x] Create `storage_exports` table (export jobs)
- [x] Add necessary indexes for performance

### Storage Dashboard
- [x] Build storage meter component (usage vs quota)
- [x] Implement usage breakdown by product (Blog, Ivy, Profile, Themes)
- [x] Add quota warning indicators (80%, 95%, 100%)
- [ ] Create usage trends chart (storage over time) *(Phase 3)*

### File Browser
- [x] Implement category view (images, attachments, documents)
- [x] Implement source view (by product)
- [x] Add search functionality
- [ ] Build file preview (images, documents) *(needs R2 integration)*
- [x] Display file metadata (size, date, dimensions)

### File Operations
- [x] Implement single file download
- [x] Implement delete to trash (soft delete)
- [x] Implement restore from trash
- [x] Implement empty trash (permanent delete)
- [x] Add quota enforcement (block uploads at 100%)

### Cron Jobs
- [x] Set up trash auto-deletion (30+ days old)
- [x] Set up export cleanup (7+ days old)

## Phase 2: Export & Add-ons

### Export System
- [x] Create export job queue
- [ ] Implement streamed zip generation (Durable Objects) *(complex, later)*
- [x] Add full export option (all files)
- [x] Add category export option
- [ ] Set up export email notifications *(needs email service)*
- [ ] Generate signed download URLs (7-day expiry) *(needs R2 setup)*

### Storage Add-ons
- [ ] Create Stripe products for add-ons (+10GB, +50GB, +100GB) *(needs Stripe)*
- [x] Implement add-on purchase flow (UI + API)
- [x] Update quota after successful purchase
- [x] Handle add-on cancellation

### API Endpoints
- [x] `GET /api/storage` - quota and usage info
- [x] `GET /api/storage/files` - paginated file list
- [x] `DELETE /api/storage/files/:id` - move to trash
- [x] `POST /api/storage/files/:id/restore` - restore from trash
- [x] `DELETE /api/storage/trash` - empty trash
- [x] `POST /api/storage/export` - start export job
- [x] `GET /api/storage/export/:id` - export status
- [x] `GET/POST /api/storage/addons` - list/purchase add-ons

## Phase 3: Polish

- [x] Grid view with image thumbnails
- [ ] Bulk file selection and operations *(UI started, backend pending)*
- [x] Sort options (date, size, name, type)
- [x] Mobile-responsive design
- [ ] Cleanup suggestions ("large unused files")

## Testing

- [x] Unit tests for quota calculations
- [x] Unit tests for file operations
- [x] Unit tests for API client
- [x] Component tests for StorageMeter
- [x] Component tests for FileGrid
- [x] Component tests for UsageBreakdown
- [ ] Integration tests for upload/download flow *(needs R2)*
- [ ] Integration tests for export generation
- [ ] E2E tests for add-on purchase flow
- [ ] Load tests for file browser (10k files)

## Migration

- [ ] Write migration script for existing R2 files
- [ ] Populate `storage_files` from existing blog uploads
- [ ] Calculate initial `user_storage` totals
- [ ] Plan gradual rollout strategy

---

## What's Ready Now

The following is implemented and ready for testing:

1. **Project Structure** - SvelteKit + Cloudflare Worker setup
2. **Database Schema** - Full D1 schema with all tables and indexes
3. **Storage Service** - Quota calculations, validation, file operations
4. **API Endpoints** - Complete REST API for all storage operations
5. **UI Components** - Dashboard, file browser, trash, add-on modal
6. **Cron Jobs** - Automatic cleanup of trash and expired exports
7. **Test Suite** - Unit and component tests with Vitest

## Next Steps (Local Machine)

See `FUTURE-commands.md` for commands to run locally with wrangler.

---

*Reference: [amber-spec.md](./amber-spec.md) for full specification*
