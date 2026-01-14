from fastapi import APIRouter, HTTPException
from app.models.schemas import LogExtractRequest, LogExtractResponse, Emotion
from app.service.log_extractor import extract_topic_and_emotion

# 라우터 생성 (prefix: /api/log)
router = APIRouter(prefix="/api/log", tags=["log"])


@router.post("/extract", response_model=LogExtractResponse)
def extract_log(request: LogExtractRequest):
    """
    Log 추출 API
    
    일기 내용에서 주제와 감정을 추출합니다.
    
    - **content**: 일기 내용
    """
    try:
        if not request.content or not request.content.strip():
            raise HTTPException(status_code=400, detail="일기 내용이 비어있습니다.")
        
        topic, emotion = extract_topic_and_emotion(request.content)
        
        return LogExtractResponse(
            topic=topic,
            emotion=emotion
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Log 추출 실패: {str(e)}")
