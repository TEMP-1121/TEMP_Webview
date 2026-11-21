# WebView-Base

배포한 웹 서비스를 Android 앱(APK)으로 감싸는 Expo 템플릿입니다.

## 바꿀 곳 3군데

1. `App.js` 맨 위 `BASE_URL` → 배포한 웹 주소 (**https://** 로 시작)
2. `app.json` → `name`(앱 이름), `slug`(영문 소문자·하이픈), `android.package`(예: `com.팀이름.앱이름`)
3. `assets/icon.png` → 팀 아이콘 (1024×1024 PNG)

해커톤 시간이 짧으니 로그인 기능은 되도록 만들지 않습니다. 로그인 없이 바로 핵심 기능을 써 볼 수 있게 해 주세요.

우리 서비스 주소가 아닌 링크는 휴대폰 브라우저로 열립니다. 앱 안에서 열어야 하는 도메인이 있으면 `App.js`의 `IN_APP_HOSTS`에 추가합니다.

## 빌드

```bash
npm install
npx eas-cli login
npx eas-cli init          # 최초 1회. app.json에 projectId가 자동으로 들어갑니다
npx eas-cli build --platform android --profile preview
```

10~15분 뒤 터미널에 나오는 링크(또는 expo.dev 대시보드)에서 APK를 받습니다.

## 빌드 전에 휴대폰으로 미리 보기

```bash
npx expo start
```

휴대폰에 Expo Go 앱을 설치하고 터미널의 QR 코드를 찍으면 바로 열립니다.
