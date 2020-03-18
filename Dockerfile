FROM python:3.6
EXPOSE 5000
WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip3 install -r requirements.txt
COPY . /app

CMD "/app/run.sh"