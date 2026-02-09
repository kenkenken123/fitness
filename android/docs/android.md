# Android App (WebView)

This module provides a simple Android WebView container for the existing fitness web experience.

## Setup

1. Open the `android/` directory in Android Studio.
2. Let Android Studio sync Gradle and download dependencies.
3. Update the base URL in `app/src/main/res/values/strings.xml` (`web_base_url`).

> Note: If `gradle/wrapper/gradle-wrapper.jar` is missing, Android Studio will regenerate it during sync. You can also run `gradle wrapper` if you have Gradle installed locally.

## Run

- Select an emulator or device in Android Studio and press **Run**.
- The app launches a single activity that loads the configured URL.

## Permissions

- `INTERNET` is enabled by default.
- Add additional permissions (camera/storage) in `AndroidManifest.xml` only if the web site requires them.
