from dataclasses import dataclass
from typing import Any, Optional

@dataclass
class ResponseModel:
    status: int
    message: str
    data: Optional[Any] = None
