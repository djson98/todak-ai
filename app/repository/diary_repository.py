"""
일기 데이터 저장소 (Repository Pattern)

Firestore를 사용하여 일기 데이터를 저장하고 조회합니다.
"""
from typing import List, Optional
from datetime import datetime
from google.cloud.firestore_v1.base_query import FieldFilter
from google.cloud.firestore_v1 import Query
from app.core.firebase import get_db
from app.models.schemas import DiaryEntry, DiaryEntryCreate, DiaryEntryUpdate
from fastapi import HTTPException

COLLECTION_NAME = "diaries"


class DiaryRepository:
    """일기 데이터 저장소 클래스"""
    
    def __init__(self):
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
        
        Bug Fix: collection.add() returns (update_time, document_reference)
        NOT (generated_id, document_reference)
        The document ID must be obtained from document_reference.id
        """
        diary_dict = {
            "user_id": diary.user_id,
            "date": diary.date.isoformat() if isinstance(diary.date, datetime) else diary.date,
            "content": diary.content,
            "emotion": diary.emotion.value,
            "created_at": datetime.now().isoformat(),
        }
        
        # ✅ FIXED: collection.add() returns (update_time, document_reference)
        # The update_time is a Timestamp object, not the document ID
        # The document ID must be obtained from document_reference.id
        update_time, doc_ref = self.collection.add(diary_dict)
        
        # Fetch the document to verify it was created and return it
        # The document ID will be extracted in _doc_to_diary_entry() from doc.id
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=500, detail="일기 생성에 실패했습니다.")
        
        return self._doc_to_diary_entry(doc)
    
    def get_by_id(self, diary_id: str) -> Optional[DiaryEntry]:
        """ID로 일기 조회"""
        doc_ref = self.collection.document(diary_id)
        doc = doc_ref.get()
        if not doc.exists:
            return None
        return self._doc_to_diary_entry(doc)
    
    def get_by_user_id(self, user_id: str) -> List[DiaryEntry]:
        """사용자 ID로 일기 목록 조회"""
        query = self.collection.where(
            filter=FieldFilter("user_id", "==", user_id)
        ).order_by("date", direction=Query.DESCENDING)
        docs = query.stream()
        diaries = [self._doc_to_diary_entry(doc) for doc in docs]
        return diaries
    
    def update(self, diary_id: str, updates: DiaryEntryUpdate) -> Optional[DiaryEntry]:
        """일기 수정"""
        doc_ref = self.collection.document(diary_id)
        doc = doc_ref.get()
        if not doc.exists:
            return None
        
        update_dict = {}
        if updates.content is not None:
            update_dict["content"] = updates.content
        if updates.emotion is not None:
            update_dict["emotion"] = updates.emotion.value
        
        if not update_dict:
            # 수정할 내용이 없으면 기존 문서 반환
            return self._doc_to_diary_entry(doc)
        
        update_dict["updated_at"] = datetime.now().isoformat()
        doc_ref.update(update_dict)
        
        # 업데이트된 문서 가져오기
        updated_doc = doc_ref.get()
        return self._doc_to_diary_entry(updated_doc)
    
    def delete(self, diary_id: str) -> bool:
        """일기 삭제"""
        doc_ref = self.collection.document(diary_id)
        doc = doc_ref.get()
        if not doc.exists:
            return False
        doc_ref.delete()
        return True
    
    def _doc_to_diary_entry(self, doc) -> DiaryEntry:
        """Firestore 문서를 DiaryEntry 모델로 변환"""
        data = doc.to_dict()
        doc_id = doc.id  # Document ID from Firestore
        return DiaryEntry(
            id=doc_id,
            user_id=data["user_id"],
            date=data["date"],
            content=data["content"],
            emotion=data["emotion"],
            created_at=datetime.fromisoformat(data.get("created_at", datetime.now().isoformat())),
        )


# 싱글톤 패턴으로 저장소 인스턴스 관리
_diary_repository = None


def get_diary_repository():
    """
    일기 저장소 인스턴스 가져오기 (Lazy initialization)
    
    Firebase가 설정되지 않은 경우에도 서버가 시작되도록 
    lazy initialization을 사용합니다.
    """
    global _diary_repository
    if _diary_repository is None:
        try:
            _diary_repository = DiaryRepository()
        except ValueError:
            # Firebase 미설정 시 ValueError 발생
            # 이 경우 None을 반환하지 않고 예외를 그대로 전파
            # 호출하는 쪽에서 처리하도록 함
            raise
    return _diary_repository
