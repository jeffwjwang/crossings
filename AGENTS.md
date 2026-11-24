# Crossings

Product name: Crossings. Seller: Vervia. v1 is English, iPhone, New Zealand.

- Do not generate puzzles inside the app. Load JSON that matches `packages/puzzle-schema`.
- Dates that mean "today" use Pacific/Auckland.
- Knowledge cards need a source. Clues and non-finale cards must not name the day's suburb.
- Expo Go cannot load react-native-mmkv or react-native-skia v3. Use `@shopify/react-native-skia` 2.x and `expo-sqlite`.
- Secrets and `ADMIN_API_TOKEN` come from the environment, never from the repo.
