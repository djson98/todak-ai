from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from app.models.schemas import DiaryEntry, DiaryEntryCreate
from app.repository.diary_repository import get_diary_repository

# 라우터 생성 (prefix: /api/diary)
router = APIRouter(prefix="/api/diary", tags=["diary"])


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
    try:
        repository = get_diary_repository()
        new_diary = repository.create(diary)
        return new_diary
    except ValueError as e:
        error_msg = str(e)
        if "Firebase" in error_msg or "Firestore" in error_msg:
            print(f"⚠️  Firebase 미설정: {error_msg}")
            raise HTTPException(
                status_code=503, 
                detail="데이터베이스가 설정되지 않았습니다. Firebase 설정이 필요합니다."
            )
        raise HTTPException(status_code=500, detail=f"일기 생성 실패: {error_msg}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"일기 생성 실패: {str(e)}")


@router.get("/", response_model=List[DiaryEntry])
def get_diaries(user_id: str):
    """
    사용자의 일기 목록 조회 API
    
    특정 사용자의 모든 일기를 가져옵니다.
    에이전트가 분석할 때 이 API를 사용합니다.
    
    - **user_id**: 조회할 사용자 ID
    """
    try:
        repository = get_diary_repository()
        user_diaries = repository.get_by_user_id(user_id)
        return user_diaries
    except ValueError as e:
        error_msg = str(e)
        if "Firebase" in error_msg or "Firestore" in error_msg:
            print(f"⚠️  Firebase 미설정: {error_msg}")
            return []  # Firebase 미설정 시 빈 배열 반환
        raise HTTPException(status_code=500, detail=f"일기 목록 조회 실패: {error_msg}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"일기 목록 조회 실패: {str(e)}")


@router.get("/{diary_id}", response_model=DiaryEntry)
def get_diary(diary_id: str):
    """
    특정 일기 조회 API
    
    일기 ID로 특정 일기를 가져옵니다.
    
    - **diary_id**: 조회할 일기 ID (문자열)
    """
    try:
        repository = get_diary_repository()
        diary = repository.get_by_id(diary_id)
    if not diary:
        raise HTTPException(status_code=404, detail="Diary not found")
    return diary
    except ValueError as e:
        error_msg = str(e)
        if "Firebase" in error_msg or "Firestore" in error_msg:
            print(f"⚠️  Firebase 미설정: {error_msg}")
            raise HTTPException(status_code=503, detail="데이터베이스가 설정되지 않았습니다.")
        raise HTTPException(status_code=500, detail=f"일기 조회 실패: {error_msg}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"일기 조회 실패: {str(e)}")


@router.delete("/{diary_id}", status_code=204)
def delete_diary(diary_id: str):
    """
    일기 삭제 API
    
    특정 일기를 삭제합니다.
    
    - **diary_id**: 삭제할 일기 ID (문자열)
    """
    try:
        repository = get_diary_repository()
        success = repository.delete(diary_id)
        if not success:
        raise HTTPException(status_code=404, detail="Diary not found")
    return None
    except ValueError as e:
        error_msg = str(e)
        if "Firebase" in error_msg or "Firestore" in error_msg:
            print(f"⚠️  Firebase 미설정: {error_msg}")
            raise HTTPException(status_code=503, detail="데이터베이스가 설정되지 않았습니다.")
        raise HTTPException(status_code=500, detail=f"일기 삭제 실패: {error_msg}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"일기 삭제 실패: {str(e)}")
