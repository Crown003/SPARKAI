import os
from pydantic import ValidationError
import pytest
from app.core.config import Settings

def test_settings_default_values() -> None:
    # Clear env vars that might affect the test
    if "PROJECT_NAME" in os.environ:
        del os.environ["PROJECT_NAME"]
    
    settings = Settings()
    assert settings.PROJECT_NAME == "SPARK AI Backend"
    assert settings.API_V1_STR == "/api/v1"
    assert settings.ENVIRONMENT == "development"

def test_settings_override_values(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("PROJECT_NAME", "Custom Backend")
    monkeypatch.setenv("ENVIRONMENT", "production")
    
    settings = Settings()
    assert settings.PROJECT_NAME == "Custom Backend"
    assert settings.ENVIRONMENT == "production"

def test_cors_origins_parsing(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("BACKEND_CORS_ORIGINS", '["http://localhost:3000"]')
    settings = Settings()
    assert len(settings.BACKEND_CORS_ORIGINS) == 1
    assert str(settings.BACKEND_CORS_ORIGINS[0]).rstrip("/") == "http://localhost:3000"

def test_invalid_cors_origins(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("BACKEND_CORS_ORIGINS", "invalid-json")
    with pytest.raises(ValidationError):
        Settings()
