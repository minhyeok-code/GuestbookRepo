=========ec2에 접속 시도 중 에러

PS C:\> ssh -i C:/guest.pem ec2-uesr@3.26.27.206 The authenticity of host '3.26.27.206 (3.26.27.206)' can't be established. ED25519 key fingerprint is SHA256:/feX9GdXiqHFz8s4ZTbQ+bvHWapkrw4v9jMCQA2CnTI. This key is not known by any other names. Are you sure you want to continue connecting (yes/no/[fingerprint])? yes Warning: Permanently added '3.26.27.206' (ED25519) to the list of known hosts. Bad permissions. Try removing permissions for user: BUILTIN\\Users (S-1-5-32-545) on file C:/guest.pem. @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @ WARNING: UNPROTECTED PRIVATE KEY FILE! @ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Permissions for 'C:/guest.pem' are too open. It is required that your private key files are NOT accessible by others. This private key will be ignored. Load key "C:/guest.pem": bad permissions ec2-uesr@3.26.27.206: Permission denied (publickey,gssapi-keyex,gssapi-with-mic).

pem file 에 권한이 너무 많기에 뜨는 에러.
window powershell 에 서는 권한변경 방법을 모르기 떄문에.. git bash를 이용하여 chmod 400 .pem 실행.
bash에서 접속 시도하니 해결 됨..


======git actions -> secrets 작성

repo-> settings -> 


======git action -> deploy.yml 파일 작성 오류

Project 구조
GuestbookRepo/
├── frontend/
│   └── Dockerfile
├── backend/
│   └── Dockerfile
├── docker-compose.yml

--> git action에 dockerfile와 위치를 알려줘야하는데 프론트와 백 모두 따로 dockerfile이 작성되어 있으면 두개 모두 작성해야함.

##  이전 delploy.yml 수정 전

name: Build and Push Docker Image

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: yourname/your-app:latest



########수정 후 deploy.yml

name: Build and Push Docker Image

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      
    ############추가, 수정 된 문장 ############
     - name: Build and push frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          file: ./frontend/Dockerfile
          push: true
          tags: yourname/frontend-app:latest

      - name: Build and push backend image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: true
          tags: yourname/backend-app:latest
          ###########



========deploy.yml image.tags
tags :  tags: yourname/backend-app:latest 에서의  username은 docker hub에서 입력된 name을 작성해야한다.
secrets에서 받아온 토큰 pw에 name과 pw가 존재.
build.steps.name과 일치해야한다는 뜻.