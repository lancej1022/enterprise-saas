# Notes

"dev:android": "expo start --android",
"dev:ios": "expo start --ios",
"android": "expo run:android",
"ios": "expo run:ios"

are all the scripts that should be needed.
Seems like you need to run `android` or `ios` before the `dev` version of the scripts actually builds properly

## Debugging broken builds

1. `npx expo install --check` <!-- this will validate the right dependencies are installed for a given expo version  -->
2. `npx expo prebuild --clean` <!-- Seems to clean out any old ios/android stuff so they dont pollute new builds -->
3. `expo run:android --device` <!-- This will allow you to reinstall the app on your emulator device  -->
