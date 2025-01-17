# FilmSync

A mobile-first web app companion for film photography. FilmSync helps you keep track of your film photos by recording location, time, and a digital reference photo for each frame you shoot.

## Features

- 📱 Mobile-first design optimized for use while shooting
- 📍 Records GPS coordinates for each photo
- 📸 Takes digital reference photos using your phone's camera
- 🎞️ Organizes photos by film roll (36 exposures per roll)
- 💾 Works offline with local storage
- 📤 Export all data as JSON

## Usage

1. Visit the web app on your phone
2. Allow camera and location permissions when prompted
3. Each time you take a film photo:
   - Point your phone at the same subject
   - Tap "Take Reference Photo"
   - The app will save the location, time, and a reference photo
4. When you finish a roll, tap "Start New Roll"
5. Use "Export Data" to download your records

### Data Structure

The app stores data in the following format:

```javascript
{
  "rolls": {
    "1": [
      {
        "timestamp": "2025-01-17T12:00:00.000Z",
        "location": {
          "latitude": 51.5074,
          "longitude": -0.1278
        },
        "imageData": "data:image/jpeg;base64,..."
      }
      // ... more photos
    ]
    // ... more rolls
  },
  "currentRoll": 1
}
```

## Privacy

- All data is stored locally in your browser
- No data is sent to any server
- GPS coordinates are only recorded when taking a photo
- You can export and delete your data at any time
