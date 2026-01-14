# Todak-AI 아키텍처 설명 프롬프트

다음 프롬프트를 AI에게 물어보세요:

---

## 프롬프트

나는 "Todak-AI"라는 감정 일기 앱을 개발하고 있어. 이 앱의 아키텍처를 팀원에게 설명해야 하는데, 화면(프론트엔드), 백엔드 API, 데이터베이스, 그리고 AI 에이전트가 어떻게 연결되어 동작하는지 명확하게 설명해줘.

### 현재 프로젝트 구조:

**프론트엔드 (모바일 앱):**
- React Native + Expo
- 현재는 로컬 스토리지(AsyncStorage) 사용 중
- 화면: HomeScreen, JournalWriteScreen, StatsScreen, SettingsScreen, LoginScreen
- 일기 CRUD 기능 구현됨

**백엔드:**
- FastAPI (Python)
- `main.py`: FastAPI 앱 엔트리포인트
- `app/api/routes/diary.py`: 일기 CRUD API (POST, GET, DELETE)
- 현재는 메모리 저장소 사용 (나중에 DB로 교체 예정)

**데이터 모델:**
- `app/models/schemas.py`에 정의됨
- DiaryEntry: 일기 모델 (user_id, date, content, emotion)
- CalendarEvent: 캘린더 이벤트 모델 (user_id, date, title, type)
- AgentRequest/AgentResponse: 에이전트 요청/응답 모델

**에이전트:**
- `app/agents/` 폴더 (아직 구현 안됨)
- 에이전트는 일기 데이터와 캘린더 이벤트를 분석해서 사용자에게 메시지를 보낼지 판단

### 설명해줘:

1. **전체 데이터 흐름**: 사용자가 일기를 작성하면 어떻게 화면 → 백엔드 → DB → 에이전트로 데이터가 흐르는지

2. **각 레이어의 역할**:
   - 프론트엔드: 무엇을 담당하는가?
   - 백엔드 API: 무엇을 담당하는가?
   - 데이터베이스: 무엇을 담당하는가?
   - 에이전트: 무엇을 담당하는가?

3. **연결 구조**: 각 레이어가 어떻게 통신하는지 (HTTP API? 직접 호출?)

4. **향후 구현 계획**: 
   - 현재 로컬 스토리지를 백엔드 API로 전환하는 방법
   - 에이전트가 일기 데이터를 어떻게 가져와서 분석하는지
   - 에이전트가 판단한 결과를 어떻게 프론트엔드로 전달하는지

5. **다이어그램으로 시각화**: 가능하면 ASCII 아트나 마크다운으로 아키텍처 다이어그램도 그려줘

---

## 사용 방법

위 프롬프트를 복사해서 Claude나 다른 AI에게 물어보면 됩니다!
