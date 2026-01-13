# Firebase 설정 가이드

이 문서는 Firebase Firestore를 데이터베이스로 사용하기 위한 설정 방법을 설명합니다.

## 목차
1. Firebase 프로젝트 생성
2. 서비스 계정 키 파일 생성
3. 환경 변수 설정
4. 테스트 확인

---

## 1. Firebase 프로젝트 생성

### Firebase Console 접속
1. [Firebase Console](https://console.firebase.google.com/)에 접속합니다.
2. "프로젝트 추가" 버튼을 클릭하여 새 프로젝트를 만듭니다.
3. 프로젝트 이름을 입력하고 필요한 설정을 완료합니다.

### Firestore Database 활성화
1. Firebase Console에서 "Firestore Database" 메뉴로 이동합니다.
2. "데이터베이스 만들기" 버튼을 클릭합니다.
3. "프로덕션 모드에서 시작" 또는 "테스트 모드에서 시작" 중 선택합니다.
   - **테스트 모드**: 처음 30일간은 무료로 모든 접근 허용 (개발용)
   - **프로덕션 모드**: 보안 규칙 필요 (운영용)

---

## 2. 서비스 계정 키 파일 생성

### 서비스 계정 설정
1. Firebase Console에서 프로젝트 설정(톱니바퀴 아이콘)으로 이동합니다.
2. "서비스 계정" 탭을 클릭합니다.
3. "새 비공개 키 생성" 또는 "Python용 SDK 관리" 섹션에서 키를 생성합니다.
4. JSON 형식의 서비스 계정 키 파일이 다운로드됩니다.
   - 파일 이름 예시: `todak-ai-firebase-key.json`

### 키 파일 보안
⚠️ **중요**: 서비스 계정 키 파일에는 중요한 정보가 포함되어 있습니다.
- 절대로 Git에 커밋하지 마세요! (이미 `.gitignore`에 추가되어 있습니다)
- 다른 사람과 공유하지 마세요
- 프로덕션 환경에서는 환경 변수로 관리하는 것을 권장합니다

---

## 3. 환경 변수 설정

### 방법 1: 서비스 계정 키 파일 사용 (권장: 로컬 개발)

1. 다운로드한 서비스 계정 키 파일을 프로젝트 루트 디렉토리에 배치합니다.
   ```
   /Users/marine/Desktop/upstage/todak-ai/todak-ai/
   ├── todak-ai-firebase-key.json  ← 여기에 배치
   ├── main.py
   ├── .env
   └── ...
   ```

2. `.env` 파일에 경로 설정:
   ```env
   FIREBASE_CREDENTIALS_PATH=./todak-ai-firebase-key.json
   ```

### 방법 2: 환경 변수에 JSON 문자열 직접 저장 (권장: 서버 배포)

1. 서비스 계정 키 파일의 내용을 모두 복사합니다.

2. `.env` 파일에 JSON 문자열로 저장:
   ```env
   FIREBASE_CREDENTIALS_JSON='{"type":"service_account","project_id":"your-project-id",...}'
   ```

3. 또는 운영 환경에서는 시스템 환경 변수로 설정:
   ```bash
   export FIREBASE_CREDENTIALS_JSON='{"type":"service_account",...}'
   ```

### 방법 3: Google Cloud 기본 인증 사용 (Google Cloud에서 실행 시)

Google Cloud 환경에서 실행 중이면 별도 설정 없이 자동으로 기본 인증을 사용합니다.

---

## 4. 테스트 확인

### 서버 실행
```bash
# 가상 환경 활성화 (예: uv venv)
source .venv/bin/activate  # 또는 uv venv 활성화

# 패키지 설치
uv sync  # 또는 pip install -r requirements.txt

# 서버 실행
uvicorn main:app --reload
```

### Firebase 초기화 확인
서버 시작 시 콘솔에 다음과 같은 메시지가 출력되면 성공입니다:
```
✅ Firebase 초기화 완료 (파일 경로 사용): ./todak-ai-firebase-key.json
```

또는

```
✅ Firebase 초기화 완료 (환경 변수 사용)
```

### API 테스트
1. 일기 생성 API 테스트:
   ```bash
   curl -X POST "http://localhost:8000/api/diary" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "test_user",
       "date": "2024-01-15T10:00:00",
       "content": "테스트 일기입니다.",
       "emotion": "JOY"
     }'
   ```

2. Firebase Console에서 확인:
   - Firebase Console → Firestore Database
   - `diaries` 컬렉션이 생성되고 데이터가 저장되어 있어야 합니다.

---

## 문제 해결

### Firebase 초기화 실패
- `FIREBASE_CREDENTIALS_PATH` 또는 `FIREBASE_CREDENTIALS_JSON`이 올바르게 설정되었는지 확인하세요.
- 서비스 계정 키 파일의 경로가 올바른지 확인하세요.
- 서비스 계정 키 파일의 권한이 올바른지 확인하세요.

### Firestore 권한 오류
- Firestore Database의 보안 규칙을 확인하세요.
- 테스트 모드에서는 30일간 모든 접근이 허용됩니다.
- 프로덕션 모드에서는 보안 규칙을 설정해야 합니다.

### 패키지 설치 오류
```bash
# Firebase Admin SDK 재설치
uv add firebase-admin
# 또는
pip install firebase-admin
```

---

## 다음 단계

- [ ] Firestore 보안 규칙 설정 (프로덕션 환경)
- [ ] Firestore 인덱스 설정 (쿼리 최적화)
- [ ] 데이터 백업 및 복원 전략 수립
