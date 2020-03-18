FROM python:3.6-slim-stretch
EXPOSE 5000
WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip3 install -r requirements.txt
COPY . /app

CMD "/app/run.sh"