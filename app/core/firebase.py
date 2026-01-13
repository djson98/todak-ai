"""
Firebase 초기화 모듈

Firebase Admin SDK를 초기화하고 Firestore 데이터베이스 인스턴스를 제공합니다.
서버 시작 시 한 번만 초기화하고, 다른 모듈에서 재사용합니다.
"""
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
from app.core.config import settings

# Firebase 앱이 이미 초기화되었는지 확인
_firebase_app = None
_db = None


def initialize_firebase():
    """
    Firebase Admin SDK 초기화
    
    서비스 계정 키 파일 또는 JSON 문자열을 사용하여 Firebase를 초기화합니다.
    """
    global _firebase_app, _db
    
    # 이미 초기화되었다면 다시 초기화하지 않음
    if _firebase_app is not None:
        return _firebase_app
    
    try:
        # 방법 1: 서비스 계정 키 파일 경로 사용
        if settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            _firebase_app = firebase_admin.initialize_app(cred)
            print(f"✅ Firebase 초기화 완료 (파일 경로 사용): {settings.FIREBASE_CREDENTIALS_PATH}")
        
        # 방법 2: 환경 변수에 JSON 문자열이 있을 경우
        elif settings.FIREBASE_CREDENTIALS_JSON:
            cred_dict = json.loads(settings.FIREBASE_CREDENTIALS_JSON)
            cred = credentials.Certificate(cred_dict)
            _firebase_app = firebase_admin.initialize_app(cred)
            print("✅ Firebase 초기화 완료 (환경 변수 사용)")
        
        # 방법 3: 기본 애플리케이션 자격 증명 사용 (Google Cloud 환경에서 실행 시)
        else:
            # Google Cloud에서 실행 중이면 기본 자격 증명 자동 사용
            _firebase_app = firebase_admin.initialize_app()
            print("✅ Firebase 초기화 완료 (기본 자격 증명 사용)")
        
        # Firestore 데이터베이스 인스턴스 가져오기
        if _firebase_app is not None:
            _db = firestore.client()
        else:
            _db = None
        
        return _firebase_app
    
    except Exception as e:
        print(f"⚠️  Firebase 초기화 실패: {e}")
        print("⚠️  Firebase 없이 서버는 실행되지만 데이터베이스 기능이 동작하지 않습니다.")
        # 서버가 시작되도록 예외를 다시 raise하지 않음
        return None


def get_db():
    """
    Firestore 데이터베이스 인스턴스 가져오기
    
    Firebase가 초기화되지 않았다면 먼저 초기화한 후 데이터베이스 인스턴스를 반환합니다.
    """
    global _db
    
    if _db is None:
        initialize_firebase()
    
    return _db
