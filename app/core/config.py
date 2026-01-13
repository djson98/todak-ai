import os
from dotenv import load_dotenv

# .env 파일에서 환경 변수 불러오기
load_dotenv()

class Settings:
    """
    애플리케이션 설정 클래스
    환경 변수나 기본값을 저장하는 곳
    """
    # Upstage API 키 (AI 모델 사용을 위해 필요)
    UPSTAGE_API_KEY: str = os.getenv("UPSTAGE_API_KEY", "")
    
    # Firebase 설정
    # Firebase 서비스 계정 키 파일 경로 (JSON 파일)
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
    # 또는 Firebase 서비스 계정 JSON 문자열 (환경 변수로 직접 넣을 경우)
    FIREBASE_CREDENTIALS_JSON: str = os.getenv("FIREBASE_CREDENTIALS_JSON", "")
    
    # 서버 설정
    HOST: str = os.getenv("HOST", "0.0.0.0")  # 모든 네트워크 인터페이스에서 접근 허용
    PORT: int = int(os.getenv("PORT", "8000"))  # 기본 포트 8000

# 설정 인스턴스 생성 (다른 파일에서 import해서 사용)
settings = Settings()
