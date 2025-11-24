<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/18HBfAVSXuYTPzSVYhdHHQ9iikJLFX8Cy

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create `.env.local` file from template:
   `cp .env.example .env.local`
3. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key
   - Get your API key from: https://aistudio.google.com/apikey
   - **Never commit your `.env.local` file to git**
4. Run the app:
   `npm run dev`

## Local Logo 적용 방법

로고 입력란에는 브라우저에서 접근 가능한 URL만 사용할 수 있습니다. 로컬 이미지를 쓰고 싶다면 아래 절차를 따르세요.

1. 원하는 이미지를 `public/assets/logos` 디렉터리에 복사합니다. (예시: `public/assets/logos/Sean J Kim _SGR.i.png`)
2. 개발 서버를 실행하면 Vite가 해당 파일을 `http://localhost:5173/assets/logos/...` 형태로 제공합니다.
3. 앱의 **설정 → 로고 설정** 섹션에서 `헤더 로고`, `클로징 로고` 입력란에 `/assets/logos/Sean J Kim _SGR.i.png`처럼 public 기준 경로를 입력합니다.
4. “열기” 버튼으로 미리보기하여 로드가 확인되면 Google Slides 생성 시에도 동일한 로고가 사용됩니다.

# SLIDE-BUILDER-AI
