# Use official Python image for Mac M1/M2 (arm64)
FROM --platform=linux/arm64 python:3.10-slim

RUN rm -rf /etc/apt/sources.list.d/* && \
    echo "deb http://mirrors.aliyun.com/debian stable main contrib non-free\ndeb http://mirrors.aliyun.com/debian stable-updates main contrib non-free\ndeb http://mirrors.aliyun.com/debian-security stable-security main contrib non-free" > /etc/apt/sources.list && \
    apt-get update --allow-releaseinfo-change && \
    apt-get install -y --fix-missing \
        build-essential \
        cmake \
        libboost-all-dev \
        libgtk-3-dev \
        openssh-server \
        vim && \
    apt-get clean && \
    apt --fix-broken install -y && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /var/run/sshd

COPY . /root/backend

RUN python3.10 -m venv /root/backend/venv && \
    /root/backend/venv/bin/pip install --upgrade pip -i https://pypi.tuna.tsinghua.edu.cn/simple && \
    /root/backend/venv/bin/pip install -r /root/backend/requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

EXPOSE 22
EXPOSE 5000

CMD ["/root/backend/venv/bin/python", "/root/backend/app.py"]
