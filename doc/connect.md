### =========ec2에 접속 시도 중 에러
<pre>
PS C:\> ssh -i C:/guest.pem ec2-uesr@3.26.27.206 The authenticity of host '3.26.27.206 (3.26.27.206)' can't be established. ED25519 key fingerprint is SHA256:/feX9GdXiqHFz8s4ZTbQ+bvHWapkrw4v9jMCQA2CnTI. This key is not known by any other names. Are you sure you want to continue connecting (yes/no/[fingerprint])? yes Warning: Permanently added '3.26.27.206' (ED25519) to the list of known hosts. Bad permissions. Try removing permissions for user: BUILTIN\\Users (S-1-5-32-545) on file C:/guest.pem. @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @ WARNING: UNPROTECTED PRIVATE KEY FILE! @ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Permissions for 'C:/guest.pem' are too open. It is required that your private key files are NOT accessible by others. This private key will be ignored. Load key "C:/guest.pem": bad permissions ec2-uesr@3.26.27.206: Permission denied (publickey,gssapi-keyex,gssapi-with-mic).
</pre>

pem file 에 권한이 너무 많기에 뜨는 에러.
window powershell 에 서는 권한변경 방법을 모르기 떄문에.. git bash를 이용하여 chmod 400 .pem 실행.
bash에서 접속 시도하니 해결 됨..


### ======git actions -> secrets 작성

repo-> settings -> 


### ======git action -> deploy.yml 파일 작성 오류
<pre>
Project 구조
GuestbookRepo/
├── frontend/
│   └── Dockerfile
├── backend/
│   └── Dockerfile
├── docker-compose.yml
</pre>
--> git action에 dockerfile와 위치를 알려줘야하는데 프론트와 백 모두 따로 dockerfile이 작성되어 있으면 두개 모두 작성해야함.

### delploy.yml 수정 전
<pre>
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
</pre>


### 수정 후 deploy.yml
<pre>
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
</pre>

### ========deploy.yml image.tags
tags :  tags: yourname/backend-app:latest 에서의  username은 docker hub에서 입력된 name을 작성해야한다.
secrets에서 받아온 토큰 pw에 name과 pw가 존재.
build.steps.name과 일치해야한다는 뜻.


### ======== 지속 적인 build error
현재 ec2에 app을 복사하는 중인데 복사가 진행중에 commit을 하면 복사중인 dir은 commit이 되지 않음..
그래서 actions에서 build할 때 dockerfile을 찾지 못하고 에러가 나는 것...


### ======= docker hub auth
Error: buildx failed with: ERROR: failed to build: failed to solve: failed to fetch oauth token: unexpected status from GET request to https://auth.docker.io/token?scope=repository%3A***%2Ffrontend-app%3Apull%2Cpush&service=registry.docker.io: 401 Unauthorized: access token has insufficient scopes

failed to fetch oauth token: 401 Unauthorized: access token has insufficient scopes

해당 문제는 docker hub에서 토큰을 받아올 때 read only로 받아와서 그런 것
권한을 read&write로 해야함 !!

### ======= github actions deploy.yml 들여쓰기
들여쓰기는 tap으로 XXXX
띄어쓰기 2번을 탭 1번의 공백으로 생각하고 사용.
tap으로 하면 오류가 남남

### ======== github actions deploy.yml  pull
<pre>
docker-compose에 
frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080
</pre>
를 통한 front와의 연결을 작성하지 않고 actions를 build하고 ec2에서 컨테이너를 확인했을 때 컨테이너가 back,db만 올라옴

이를 cat docker-compose.yml 을 입력하여 파일을 열어보면 (ec2) 이전에 작성한 docker-compose 파일이 올라와 있고 수정사항이 반영이 안된 것을 확인할 수 있었음
<pre>
[ec2-user@ip-172-31-23-63 ~]$ cat docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_USER: guestuser
      MYSQL_DATABASE: guestbook
      MYSQL_PASSWORD: guest1234
    ports:
      - "3308:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${DB_PASSWORD}"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 30s

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/guestbook
      SPRING_DATASOURCE_USERNAME: guestuser
      SPRING_DATASOURCE_PASSWORD: guest1234

</pre>
  이것은 actions 에 deploy.yml 파일에 git pull 명령어가 없어서 그런데,
<pre>
        - name: Deploy on EC2
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_KEY }}
          script: |
            docker pull choiminhyeok/backend-app:latest
            docker pull choiminhyeok/frontend-app:latest
            cd ~/guestbook
            git pull origin main
            docker compose down
            docker compose up -d
</pre>
    ec2와 연동하는 명령어에 script에서 pull 명령어를 추가하면 문제를 해결할 수 있음.



### ======== ec2 git push 워크플로 
<pre>
script: |
  sudo yum install git -y  
  rm -rf ~/guestbook       
  git clone https://github.com/너의-깃허브-유저/guestbook.git ~/guestbook
  cd ~/guestbook
  docker pull choiminhyeok/backend-app:latest
  docker pull choiminhyeok/frontend-app:latest
  docker compose down
  docker compose up -d
  </pre>

build시마다 기존 app을 삭제하고 pull을 할것인가 pull만 하여 덮어쓸 것인가

이건 추적불가능한 캐시나 데이터들이 얼마나 만들어지냐에 따라 다르다..
