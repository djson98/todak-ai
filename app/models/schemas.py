from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

# ==========================================
# 감정 타입 정의
# ==========================================
class Emotion(str, Enum):
    """감정 타입 - 기획서의 6가지 핵심 감정"""
    JOY = "JOY"              # 기쁨
    CALM = "CALM"            # 평온
    SADNESS = "SADNESS"      # 슬픔
    ANGER = "ANGER"          # 화남
    ANXIETY = "ANXIETY"      # 불안
    EXHAUSTED = "EXHAUSTED"  # 지침

# ==========================================
# 일기 관련 모델
# ==========================================
class DiaryEntryBase(BaseModel):
    """일기 기본 모델 (입력용)"""
    user_id: str
    date: datetime
    content: str
    emotion: Emotion

class DiaryEntryCreate(DiaryEntryBase):
    """일기 생성 요청 모델 (프론트엔드에서 받을 때)"""
    pass

class DiaryEntry(DiaryEntryBase):
    """일기 응답 모델 (저장 후 반환할 때)"""
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# ==========================================
# 캘린더 관련 모델
# ==========================================
class CalendarEventType(str, Enum):
    """캘린더 이벤트 타입 - 심리적 성격 기반 분류"""
    PERFORMANCE = "PERFORMANCE"    # 평가/성과: 긴장과 스트레스를 유발하는 일
    SOCIAL = "SOCIAL"              # 사회/관계: 사람을 만나고 에너지를 쓰는 일
    CELEBRATION = "CELEBRATION"    # 기념일: 축하하거나 챙겨야 하는 날
    HEALTH = "HEALTH"              # 건강/치료: 신체/정신적 케어가 필요한 일
    LEISURE = "LEISURE"            # 휴식/여가: 리프레시를 위한 일
    ROUTINE = "ROUTINE"            # 일상/기타: 특별한 감정 소모가 없는 단순 일정

class CalendarEventBase(BaseModel):
    """캘린더 이벤트 기본 모델"""
    user_id: str
    date: datetime
    title: str
    type: CalendarEventType

class CalendarEventCreate(CalendarEventBase):
    """캘린더 이벤트 생성 요청 모델"""
    pass

class CalendarEvent(CalendarEventBase):
    """캘린더 이벤트 응답 모델"""
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# ==========================================
# 에이전트 관련 모델
# ==========================================
class AgentRequest(BaseModel):
    """에이전트 1 요청 모델
    
    context.ipynb의 run_todak_agent 함수가 받는 데이터 구조
    """
    current_time: str  # "YYYY-MM-DD HH:mm:ss"
    notification_setting: str  # "ON" | "OFF"
    calendar_events: List[dict]  # [{"date": "...", "title": "...", "type": "..."}]
    diary_entries: List[dict]  # [{"date": "...", "content": "...", "emotion": "..."}]

class AgentResponse(BaseModel):
    """에이전트 1 응답 모델
    
    context.ipynb의 run_todak_agent 함수가 반환하는 데이터 구조
    """
    should_send: bool
    send_time: str  # "YYYY-MM-DD HH:mm:ss"
    message: Optional[str] = None  # should_send가 false면 null
    reason: str  # 판단 사유 및 맥락 분석 결과
