# QR Code Tracking Debug Guide

## How to See Errors When Scanning QR Codes on Mobile

### Method 1: Check Browser Console on Mobile

#### For Android (Chrome):
1. Connect your phone to your computer via USB
2. Enable USB Debugging on your phone (Settings > Developer Options > USB Debugging)
3. Open Chrome on your computer
4. Go to `chrome://inspect` in the address bar
5. Click "Inspect" next to your phone's browser session
6. Open the Console tab to see all logs

#### For iPhone (Safari):
1. On iPhone: Settings > Safari > Advanced > Web Inspector (enable it)
2. Connect iPhone to Mac via USB
3. On Mac: Open Safari > Develop menu > Select your iPhone > Select the page
4. Open the Console tab to see logs

### Method 2: Check Analytics Dashboard

1. Go to `/dashboard/events/[eventId]/analytics`
2. Look at the **"Recent QR Scans"** section
3. You'll see:
   - ✅ **Blue dot** = QR code scanned but form not submitted
   - ✅ **Green dot** = QR code scanned AND form submitted (converted)
   - Timestamp of when scan happened
   - Session ID
   - Device type (Mobile/Desktop)

### Method 3: Check Console Logs (Already Added)

The tracking code now logs detailed information:
- 🔍 **Starting QR scan tracking...** - When tracking starts
- ✅ **QR Scan tracked successfully!** - When tracking works
- ❌ **QR Tracking Failed:** - When there's an error (with details)
- ❌ **QR Tracking Network Error:** - When network fails

### Method 4: Test Tracking Manually

1. Open the event page on your phone
2. Open browser console (see Method 1)
3. Look for the emoji logs (🔍, ✅, or ❌)
4. Check if you see "QR Scan tracked successfully!"

### What to Look For:

#### ✅ Success Indicators:
- Console shows: `✅ QR Scan tracked successfully!`
- Analytics page shows new scan in "Recent QR Scans"
- "Total QR Scans" count increases

#### ❌ Error Indicators:
- Console shows: `❌ QR Tracking Failed:` or `❌ QR Tracking Network Error:`
- Analytics page shows no new scans
- Check the error message in console for details

### Common Issues:

1. **"Event not found or not published"**
   - Make sure the event is published (`is_published = true`)
   - Check that the event ID is correct

2. **"Failed to track QR scan"**
   - Check database connection
   - Verify `event_registration_analytics` table exists
   - Check RLS policies allow inserts

3. **Network errors**
   - Check internet connection
   - Verify API route is accessible
   - Check server logs

### Quick Test:

1. Scan QR code with your phone
2. Open browser console (Method 1)
3. Look for the tracking logs
4. Check analytics dashboard for the new scan
5. If you see errors, copy the error message and check the API route logs

