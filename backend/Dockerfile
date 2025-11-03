FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY pyproject.toml ./

RUN pip install --upgrade pip && pip install -e .

COPY . .

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
