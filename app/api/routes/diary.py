from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from app.models.schemas import DiaryEntry, DiaryEntryCreate

# 라우터 생성 (prefix: /api/diary)
router = APIRouter(prefix="/api/diary", tags=["diary"])

# 임시 저장소 (메모리) - 나중에 데이터베이스로 교체
# 실제로는 SQLite나 PostgreSQL 같은 데이터베이스 사용
diary_storage: List[DiaryEntry] = []
diary_id_counter = 1

@router.post("/", response_model=DiaryEntry, status_code=201)
def create_diary(diary: DiaryEntryCreate):
    """
    일기 생성 API
    
    프론트엔드에서 사용자가 일기를 작성하면 이 API로 전송됩니다.
    
    - **user_id**: 사용자 ID
    - **date**: 일기 작성 날짜/시간
    - **content**: 일기 내용
    - **emotion**: 감정 타입 (JOY, CALM, SADNESS, ANGER, ANXIETY, EXHAUSTED)
    """
    global diary_id_counter
    
    # DiaryEntryCreate를 DiaryEntry로 변환 (id 추가)
    new_diary = DiaryEntry(
        id=diary_id_counter,
        user_id=diary.user_id,
        date=diary.date,
        content=diary.content,
        emotion=diary.emotion,
        created_at=datetime.now()
    )
    
    # 저장소에 추가
    diary_storage.append(new_diary)
    diary_id_counter += 1
    
    return new_diary

@router.get("/", response_model=List[DiaryEntry])
def get_diaries(user_id: str):
    """
    사용자의 일기 목록 조회 API
    
    특정 사용자의 모든 일기를 가져옵니다.
    에이전트가 분석할 때 이 API를 사용합니다.
    
    - **user_id**: 조회할 사용자 ID
    """
    # 해당 사용자의 일기만 필터링
    user_diaries = [d for d in diary_storage if d.user_id == user_id]
    
    # 날짜순으로 정렬 (최신순)
    user_diaries.sort(key=lambda x: x.date, reverse=True)
    
    return user_diaries

@router.get("/{diary_id}", response_model=DiaryEntry)
def get_diary(diary_id: int):
    """
    특정 일기 조회 API
    
    일기 ID로 특정 일기를 가져옵니다.
    
    - **diary_id**: 조회할 일기 ID
    """
    # ID로 일기 찾기
    diary = next((d for d in diary_storage if d.id == diary_id), None)
    
    if not diary:
        raise HTTPException(status_code=404, detail="Diary not found")
    
    return diary

@router.delete("/{diary_id}", status_code=204)
def delete_diary(diary_id: int):
    """
    일기 삭제 API
    
    특정 일기를 삭제합니다.
    
    - **diary_id**: 삭제할 일기 ID
    """
    global diary_storage
    
    # ID로 일기 찾기
    diary_index = next((i for i, d in enumerate(diary_storage) if d.id == diary_id), None)
    
    if diary_index is None:
        raise HTTPException(status_code=404, detail="Diary not found")
    
    # 삭제
    diary_storage.pop(diary_index)
    
    return None
