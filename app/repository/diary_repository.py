"""
일기 Repository 모듈

Firebase Firestore를 사용하여 일기 데이터를 저장하고 조회하는 로직을 담당합니다.
Repository 패턴을 사용하여 데이터 접근 로직을 분리합니다.
"""
from typing import List, Optional
from datetime import datetime
from google.cloud.firestore_v1.base_query import FieldFilter
from google.cloud.firestore_v1 import Query
from app.core.firebase import get_db
from app.models.schemas import DiaryEntry, DiaryEntryCreate
from fastapi import HTTPException

# Firestore 컬렉션 이름 (데이터를 저장할 테이블 같은 것)
COLLECTION_NAME = "diaries"


class DiaryRepository:
    """
    일기 데이터를 Firebase Firestore에서 관리하는 Repository 클래스
    
    데이터를 저장하고 조회하는 모든 작업을 담당합니다.
    """
    
    def __init__(self):
        """Firestore 데이터베이스 인스턴스 가져오기"""
        try:
            self.db = get_db()
            if self.db is None:
                raise ValueError("Firebase가 초기화되지 않았습니다. 환경 변수를 설정해주세요.")
            self.collection = self.db.collection(COLLECTION_NAME)
        except Exception as e:
            raise ValueError(f"Firestore 연결 실패: {str(e)}. Firebase 설정을 확인해주세요.")
    
    def create(self, diary: DiaryEntryCreate) -> DiaryEntry:
        """
        일기 생성
        
        Firestore에 새로운 일기를 저장하고, 생성된 문서를 DiaryEntry로 반환합니다.
        
        Args:
            diary: 생성할 일기 데이터 (DiaryEntryCreate)
        
        Returns:
            생성된 일기 데이터 (DiaryEntry)
        """
        # DiaryEntryCreate를 딕셔너리로 변환 (Firestore에 저장하기 위해)
        diary_dict = {
            "user_id": diary.user_id,
            "date": diary.date.isoformat() if isinstance(diary.date, datetime) else diary.date,
            "content": diary.content,
            "emotion": diary.emotion.value,
            "created_at": datetime.now().isoformat(),
        }
        
        # Firestore에 문서 추가 (자동으로 ID 생성)
        # add()는 (generated_id, document_reference) 튜플을 반환
        generated_id, doc_ref = self.collection.add(diary_dict)
        
        # 생성된 문서 가져오기
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=500, detail="일기 생성에 실패했습니다.")
        
        # Firestore 문서를 DiaryEntry로 변환
        return self._doc_to_diary_entry(doc)
    
    def get_by_id(self, diary_id: str) -> Optional[DiaryEntry]:
        """
        ID로 일기 조회
        
        Args:
            diary_id: 조회할 일기 ID
        
        Returns:
            일기 데이터 (DiaryEntry) 또는 None
        """
        doc_ref = self.collection.document(diary_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        return self._doc_to_diary_entry(doc)
    
    def get_by_user_id(self, user_id: str) -> List[DiaryEntry]:
        """
        사용자 ID로 일기 목록 조회
        
        특정 사용자의 모든 일기를 가져옵니다. 날짜순으로 정렬합니다 (최신순).
        
        Args:
            user_id: 조회할 사용자 ID
        
        Returns:
            일기 목록 (List[DiaryEntry])
        """
        # user_id로 필터링하여 조회
        query = self.collection.where(
            filter=FieldFilter("user_id", "==", user_id)
        ).order_by("date", direction=Query.DESCENDING)
        
        docs = query.stream()
        
        # Firestore 문서들을 DiaryEntry 리스트로 변환
        diaries = [self._doc_to_diary_entry(doc) for doc in docs]
        
        return diaries
    
    def delete(self, diary_id: str) -> bool:
        """
        일기 삭제
        
        Args:
            diary_id: 삭제할 일기 ID
        
        Returns:
            삭제 성공 여부 (bool)
        """
        doc_ref = self.collection.document(diary_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
        
        doc_ref.delete()
        return True
    
    def _doc_to_diary_entry(self, doc) -> DiaryEntry:
        """
        Firestore 문서를 DiaryEntry 모델로 변환
        
        Args:
            doc: Firestore 문서
        
        Returns:
            DiaryEntry 모델
        """
        data = doc.to_dict()
        doc_id = doc.id
        
        return DiaryEntry(
            id=int(doc_id) if doc_id.isdigit() else doc_id,  # ID가 숫자면 int로, 아니면 그대로
            user_id=data["user_id"],
            date=data["date"],
            content=data["content"],
            emotion=data["emotion"],
            created_at=datetime.fromisoformat(data.get("created_at", datetime.now().isoformat())),
        )


# Repository 인스턴스 (lazy initialization - 실제 사용할 때 생성)
_diary_repository = None

def get_diary_repository():
    """
    DiaryRepository 인스턴스 가져오기 (lazy initialization)
    
    Firebase가 설정되지 않았을 때도 서버가 시작될 수 있도록
    실제 사용할 때 Repository를 생성합니다.
    """
    global _diary_repository
    if _diary_repository is None:
        _diary_repository = DiaryRepository()
    return _diary_repository
