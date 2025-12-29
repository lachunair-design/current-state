# Current State - Deployment Checklist

## Pre-Deployment Checklist ✅

### 1. Branding Assets (USER ACTION REQUIRED)
- [ ] Add `/public/favicon.ico` (32x32px)
- [ ] Add `/public/icon-192.png` (192x192px)
- [ ] Add `/public/icon-512.png` (512x512px)
- [ ] Add `/public/apple-touch-icon.png` (180x180px)
- [ ] Add `/public/og-image.png` (1200x630px for social sharing)

**Instructions**: See `BRANDING-SETUP.md` for detailed steps on creating these files from your logo.

### 2. Environment Variables
Ensure these are set in Vercel project settings:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### 3. Code Quality
- [x] All pages use consistent dark theme
- [x] Privacy Policy created (`/privacy`)
- [x] Terms of Service created (`/terms`)
- [x] Custom 404 page created
- [x] Landing page includes "free trial" messaging
- [x] Sean Ellis feedback questionnaire integrated
- [x] Feature request CTA added to dashboard
- [x] Profile page colors fixed
- [x] SEO metadata configured
- [x] PWA manifest created

### 4. Build Verification
- [ ] Run `npm run build` to verify production build
- [ ] Check for TypeScript errors
- [ ] Check for build warnings
- [ ] Verify all routes compile successfully

### 5. Git Operations
- [ ] Commit all changes with descriptive message
- [ ] Push to branch `claude/fix-vercel-error-9H8KR`
- [ ] Verify push successful

---

## Vercel Deployment Steps

### Initial Setup
1. **Create Vercel Project**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the repository: `lachunair-design/current-state`
   - Framework Preset: Next.js
   - Root Directory: `./` (leave as default)

2. **Configure Environment Variables**
   - Click "Environment Variables"
   - Add `NEXT_PUBLIC_SUPABASE_URL` (from Supabase project settings)
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from Supabase project settings)
   - Apply to: Production, Preview, and Development

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-5 minutes)
   - Check deployment logs for any errors

### Domain Configuration (Optional)
1. Go to Project Settings → Domains
2. Add custom domain: `currentstate.app`
3. Follow Vercel's DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

---

## Post-Deployment Verification

### Functional Testing
- [ ] Homepage loads correctly at deployed URL
- [ ] Sign up flow works (create test account)
- [ ] Login flow works
- [ ] Dashboard loads with all components
- [ ] Check-in page works
- [ ] Tasks page works
- [ ] Goals page works
- [ ] Habits page works
- [ ] Profile page works
- [ ] Feedback card displays (after 3 days)
- [ ] Feature request CTA links to profile
- [ ] Today's Focus card with Pomodoro timer works
- [ ] Mark Complete updates task status

### Legal Pages
- [ ] Privacy Policy accessible at `/privacy`
- [ ] Terms of Service accessible at `/terms`
- [ ] 404 page displays for invalid routes

### SEO & PWA
- [ ] Open Graph meta tags render (test with https://www.opengraph.xyz/)
- [ ] Twitter card preview works
- [ ] Favicon displays in browser tab
- [ ] PWA installable on mobile (Add to Home Screen)
- [ ] App icons display correctly when installed

### Performance
- [ ] Lighthouse score > 90 for Performance
- [ ] Lighthouse score > 90 for Accessibility
- [ ] Lighthouse score > 90 for Best Practices
- [ ] Lighthouse score > 90 for SEO
- [ ] No console errors in browser
- [ ] All images load correctly

---

## Known Limitations for Launch

1. **Logo Images**: Need to be added manually (see BRANDING-SETUP.md)
2. **Email Setup**: Supabase auth emails use default templates (can customize later)
3. **Analytics**: No analytics configured yet (can add Google Analytics/Plausible later)
4. **Monitoring**: No error monitoring (can add Sentry later)

---

## Quick Rollback Plan

If something goes wrong:
1. Go to Vercel dashboard → Deployments
2. Find the last working deployment
3. Click the three dots → "Promote to Production"

---

## Post-Launch Tasks (Not Urgent)

- [ ] Set up custom domain (currentstate.app)
- [ ] Configure email templates in Supabase
- [ ] Add analytics (Plausible or Google Analytics)
- [ ] Set up error monitoring (Sentry)
- [ ] Create sitemap.xml
- [ ] Submit to search engines
- [ ] Monitor Sean Ellis scores
- [ ] Review feature requests
- [ ] Plan next features based on user feedback

---

## Support Contacts

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Next.js Docs**: https://nextjs.org/docs

---

**Status**: Ready for deployment after logo images are added ✨
**Estimated Time**: 30-45 minutes (excluding logo creation)
**Launch Blocker**: Logo images in `/public` directory

Good luck with your launch! 🚀
