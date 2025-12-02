<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1lP98Z2S_olm9gQFCOxj-BsPRGBq3xaUn

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Build for Android

Use the included Android project to ship the web app as an Android App Bundle (AAB):

1. Build the web assets and sync them into the native project:
   `npm run android:sync`
2. Open the `android` folder in Android Studio.
3. Let Android Studio download the Gradle dependencies when prompted (the `gradlew` scripts will download the wrapper JAR automatically), then run **Build > Build Bundle(s) / APK(s) > Build Bundle(s)** to produce the release AAB.

The Android project loads the compiled Vite output directly from `app/src/main/assets/public/index.html` using a WebView, so no extra native configuration is required.

## Export a ready-to-share ZIP

If you need a single archive with the synchronized Android project and web assets, run:

```bash
npm run android:sync
zip -r irontrack-android.zip . -x "node_modules/*" ".git/*" "android/.gradle/*"
```

This produces `irontrack-android.zip` at the repository root containing the `android/` project, Gradle wrapper scripts, and the bundled web assets under `android/app/src/main/assets/public`.
