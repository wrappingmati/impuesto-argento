"""Application entrypoint to launch the Uvicorn server."""

import uvicorn
from app.config import settings

if __name__ == "__main__":
    print(f"🚀 Iniciando {settings.APP_NAME} en http://{settings.HOST}:{settings.PORT}")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info",
    )

