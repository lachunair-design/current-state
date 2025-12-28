# Celebration System Debug Guide

The celebration system has been updated with comprehensive debug logging to help diagnose why celebrations might not be appearing.

## How to Debug

### Step 1: Open Browser Console

1. Open your app in the browser
2. Open Developer Tools (F12 or Right-click → Inspect)
3. Go to the **Console** tab

### Step 2: Trigger a Celebration

Complete a task or habit in one of these ways:
- **Tasks page**: Click the checkbox next to a task or use the "Complete" button in the menu
- **Check-in page**: Complete a matched task during daily check-in
- **Habits page**: Click one of the version buttons (Full, Scaled, or Minimal)

### Step 3: Check Console Logs

You should see logs like this in the console:

```
🎊 useCelebration render, celebration: null
🎊 celebrate() called with message: You completed "Task name"! Keep up the great work! 💪
🎊 useCelebration render, celebration: { message: "..." }
🎉 Celebration mounted with message: You completed "Task name"! Keep up the great work! 💪
🎉 Celebration auto-hiding after 3000 ms
🎊 clear() called - hiding celebration
🎉 Celebration cleanup
```

## Diagnosing Issues

### Scenario 1: No console logs at all
**Problem**: The celebrate() function isn't being called
**Possible causes**:
- The async database update is failing
- Task/habit not found in state
- Event handler not wired correctly

**Fix**: Check for other error messages in console

### Scenario 2: See "celebrate() called" but no "Celebration mounted"
**Problem**: The Celebration component isn't rendering
**Possible causes**:
- CelebrationComponent not added to JSX
- React rendering issue

**Fix**: Verify CelebrationComponent is in the page JSX

### Scenario 3: See all logs but no visual celebration
**Problem**: The celebration is rendering but not visible
**Possible causes**:
- CSS not loading properly
- Z-index conflicts
- Confetti animation not working

**Fixes to try**:
1. Check if `globals.css` includes the confetti styles
2. Inspect element in browser DevTools to see if celebration div exists
3. Check for CSS errors in console
4. Try increasing z-index in Celebration component (currently z-50)

### Scenario 4: Celebration shows but confetti doesn't fall
**Problem**: Confetti CSS animation not working
**Possible causes**:
- Missing confetti styles in globals.css
- CSS not being applied

**Fix**: Verify `globals.css` has these styles:
```css
@keyframes confetti-fall {
  to {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10px;
  animation: confetti-fall 3s linear forwards;
}
```

## Expected Behavior

When working correctly:
1. **Visual**:
   - Celebration modal appears in center of screen
   - 50 colorful confetti particles fall from top
   - "🎉 Amazing!" header with party popper icon
   - Your personalized success message
2. **Timing**: Auto-dismisses after 3 seconds
3. **Console**: Shows all the 🎊 and 🎉 logs

## Testing Each Page

### Tasks Page
1. Go to `/tasks`
2. Create a new task or use an existing one
3. Click the checkbox or "Complete" button
4. **Expected**: Celebration with message "You completed '[task title]'! Keep up the great work! 💪"

### Check-in Page
1. Go to `/checkin`
2. Complete the energy questionnaire
3. Complete a matched task
4. **Expected**: Celebration with message "You completed '[task title]'! Keep building momentum! 💪"

### Habits Page
1. Go to `/habits`
2. Create a habit or use existing one
3. Click Full, Scaled, or Minimal version button
4. **Expected**: Celebration with message "You completed the [version] of '[habit title]'! [why_this_helps] 💚"

## Removing Debug Logs

Once the celebration system is working, you can remove the debug logs by editing `src/components/Celebration.tsx` and removing all `console.log()` statements.

## Still Not Working?

If you've tried all the above and celebrations still don't work:

1. **Clear browser cache** and hard reload (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check for JavaScript errors** in console that might be breaking React
3. **Try in incognito/private window** to rule out browser extensions
4. **Verify you're on the latest code** - pull latest changes and rebuild

If none of that works, share:
- What console logs you see (if any)
- Screenshots of the console
- Browser and version you're using
