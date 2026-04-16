FROM python:3.14.4-trixie

WORKDIR /app

COPY requirements.txt requirements.txt

RUN python3 -m pip install -r requirements.txt

COPY . .

CMD [ "python3", "app.py"]