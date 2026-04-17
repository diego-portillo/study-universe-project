# FROM python:3.14.4-trixie

# WORKDIR /app

# COPY requirements.txt requirements.txt

# RUN python3 -m pip install -r requirements.txt

# COPY . .

# CMD [ "python3", "app.py"]

#------------------------------------
# smaller size

# ---- build stage ----
FROM python:3.14-slim AS builder
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ---- runtime stage ----
FROM python:3.14-slim
WORKDIR /app

COPY --from=builder /install /usr/local
COPY . .

CMD ["python", "app.py"]