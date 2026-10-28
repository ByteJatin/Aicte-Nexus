from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

Priority = Literal["Critical", "High", "Medium", "Low"]
ComplaintStatus = Literal[
    "Submitted", "Under Review", "In Progress", "Awaiting Information", "Resolved", "Closed"
]
CaseLinkState = Literal["Pending Review", "Confirmed Link", "Merged Duplicate", "Dismissed"]


class InstitutionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    aicte_id: str
    name: str
    city: str
    state: str
    region: str
    institution_type: str
    intake: int
    risk_score: int
    eoa_status: str
    eoa_hold: bool
    hold_reason: str
    summary: str
    is_demo: bool


class BureauRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str
    name: str


class ComplaintCreate(BaseModel):
    case_id: str = Field(pattern=r"^CMP-\d{4}-\d{4,}$", max_length=20)
    institution_id: str = Field(min_length=1, max_length=20)
    bureau_code: str = Field(min_length=1, max_length=60)
    category: str = Field(min_length=2, max_length=120)
    title: str = Field(min_length=5, max_length=500)
    priority: Priority
    status: ComplaintStatus = "Submitted"
    assigned_officer: str = Field(min_length=2, max_length=160)
    source: str = Field(min_length=2, max_length=100)
    complainant: str = Field(min_length=2, max_length=160)
    filed_date: date
    due_date: date
    resolution_note: str | None = Field(default=None, max_length=5000)
    linked_case_ids: list[str] = Field(default_factory=list, max_length=100)
    actor: str | None = Field(default=None, max_length=160)

    @model_validator(mode="after")
    def validate_dates_and_resolution(self):
        for field_name in ("institution_id", "bureau_code", "category", "title", "assigned_officer", "source", "complainant"):
            if not getattr(self, field_name).strip():
                raise ValueError(f"{field_name} cannot be blank")
        if self.due_date < self.filed_date:
            raise ValueError("due_date must be on or after filed_date")
        if self.status in {"Resolved", "Closed"} and len((self.resolution_note or "").strip()) < 15:
            raise ValueError("Resolved or Closed complaints require a resolution_note of at least 15 characters")
        return self


class ComplaintUpdate(BaseModel):
    institution_id: str | None = Field(default=None, min_length=1, max_length=20)
    bureau_code: str | None = Field(default=None, min_length=1, max_length=60)
    category: str | None = Field(default=None, min_length=2, max_length=120)
    title: str | None = Field(default=None, min_length=5, max_length=500)
    priority: Priority | None = None
    status: ComplaintStatus | None = None
    assigned_officer: str | None = Field(default=None, min_length=2, max_length=160)
    source: str | None = Field(default=None, min_length=2, max_length=100)
    complainant: str | None = Field(default=None, min_length=2, max_length=160)
    filed_date: date | None = None
    due_date: date | None = None
    resolution_note: str | None = Field(default=None, max_length=5000)
    actor: str | None = Field(default=None, max_length=160)

    @model_validator(mode="after")
    def validate_patch(self):
        for field_name in self.model_fields_set - {"resolution_note"}:
            if getattr(self, field_name) is None:
                raise ValueError(f"{field_name} cannot be null")
            value = getattr(self, field_name)
            if isinstance(value, str) and field_name != "status" and not value.strip():
                raise ValueError(f"{field_name} cannot be blank")
        if self.status in {"Resolved", "Closed"} and len((self.resolution_note or "").strip()) < 15:
            raise ValueError("Setting status to Resolved or Closed requires a resolution_note of at least 15 characters")
        return self


class ComplaintRead(BaseModel):
    case_id: str
    institution_id: str
    institution_name: str
    bureau_code: str
    bureau: str
    category: str
    title: str
    priority: Priority
    status: ComplaintStatus
    assigned_officer: str
    source: str
    complainant: str
    filed_date: date
    due_date: date
    overdue_days: int
    is_overdue: bool
    linked_cases: list[str]
    resolution_notes: str | None
    is_demo: bool
    created_at: datetime
    updated_at: datetime


class InstitutionUpdate(BaseModel):
    eoa_hold: bool | None = None
    eoa_status: str | None = Field(default=None, min_length=2, max_length=100)
    hold_reason: str | None = Field(default=None, max_length=5000)
    actor: str | None = Field(default=None, max_length=160)

    @model_validator(mode="after")
    def require_update_value(self):
        if not (self.model_fields_set - {"actor"}):
            raise ValueError("At least one institution field must be supplied")
        for field_name in self.model_fields_set - {"actor"}:
            if getattr(self, field_name) is None:
                raise ValueError(f"{field_name} cannot be null")
        return self


class CaseLinkCreate(BaseModel):
    source_case_id: str = Field(pattern=r"^CMP-\d{4}-\d{4,}$", max_length=20)
    target_case_id: str = Field(pattern=r"^CMP-\d{4}-\d{4,}$", max_length=20)
    relationship_type: str = Field(min_length=2, max_length=60)
    similarity_score: float | None = Field(default=None, ge=0, le=100)
    state: CaseLinkState = "Pending Review"
    note: str | None = Field(default=None, max_length=5000)
    suggestion_id: str | None = Field(default=None, max_length=40)
    actor: str | None = Field(default=None, max_length=160)

    @model_validator(mode="after")
    def require_distinct_cases(self):
        if not self.relationship_type.strip():
            raise ValueError("relationship_type cannot be blank")
        if self.source_case_id == self.target_case_id:
            raise ValueError("A case cannot be linked to itself")
        return self


class CaseLinkUpdate(BaseModel):
    state: CaseLinkState
    note: str | None = Field(default=None, max_length=5000)
    actor: str | None = Field(default=None, max_length=160)


class CaseLinkRead(BaseModel):
    id: int
    source_case_id: str
    target_case_id: str
    relationship_type: str
    similarity_score: float | None
    state: str
    note: str | None
    suggestion_id: str | None
    is_demo: bool
    created_at: datetime
    reviewed_at: datetime | None


class WorkflowEventRead(BaseModel):
    id: int
    complaint_id: str
    event_type: str
    from_status: str | None
    to_status: str | None
    from_bureau_code: str | None
    to_bureau_code: str | None
    assigned_officer: str | None
    actor: str | None
    note: str | None
    is_demo: bool
    occurred_at: datetime


class AuditEventCreate(BaseModel):
    action_type: str = Field(min_length=2, max_length=60)
    entity_type: str = Field(default="system", min_length=2, max_length=60)
    entity_id: str = Field(min_length=1, max_length=60)
    actor: str = Field(min_length=2, max_length=160)
    bureau_code: str | None = Field(default=None, max_length=60)
    bureau_label: str | None = Field(default=None, max_length=100)
    details: str = Field(min_length=1, max_length=10000)

    @model_validator(mode="after")
    def require_nonblank_content(self):
        for field_name in ("action_type", "entity_type", "entity_id", "actor", "details"):
            if not getattr(self, field_name).strip():
                raise ValueError(f"{field_name} cannot be blank")
        return self


class AuditEventRead(BaseModel):
    id: int
    occurred_at: datetime
    action_type: str
    entity_type: str
    entity_id: str
    actor: str | None
    bureau_code: str | None
    bureau: str
    details: str
    is_demo: bool

