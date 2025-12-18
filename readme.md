
## PROJECT STRUCTURE
<pre>
Guestbook/
├─.github
│ └─workflows/
│ │ └─deploy.yml
├─backend/
│ ├─.gradle
│ ├─.idea
│ ├─build
│ ├─gradle
│ └─src/
│ ├─main/
│ │ ├─java/
│ │ │ └─org/
│ │ │ └─example/
│ │ │ └─simpleproject/
│ │ │ │ ├─config
│ │ │ │ ├─controller
│ │ │ │ ├─entity
│ │ │ │ ├─repository
│ │ │ │ └─service
│ │ └─resources/
│ │ ├─static/
│ │ └─templates/
│
│ └─dockerfile
├─doc/
│ ├─connect.md
│ ├─debug.me
│ ├─EC2.md
│ └─front.md
│ └─workflow.md
├─frontend/
│ ├─app/
│ │ ├─guestbook/
│ │ │ └─components
│ │ │ └─AddGuestbook.js
│ │ │ └─List.js
│ ├─page.js
│ └─Dockerfile
├─docker-compose.prod.yml
└─.env
</pre>


# API 명세서

## 1. 전체 다짐 목록 조회
| 항목 | 내용 |
|------|------|
| URL | GET /api/guestbooks |
| Request | 없음 |
| Response | `[{ id, nickname, content, createdAt }, ...]` |

## 2. 다짐 등록

| 항목 | 내용 |
|------|------|
| URL | POST /api/guestbooks |
| Request | `{ nickname, content }` |
| Response | `{ id, nickname, content, createdAt }` |


# Docker 구성 설명

## 1. Docker를 사용하는 이유

컨테이너를 올리는 것으로 배포를 쉽게 할 수 있음.
다양한 환경에서 실행할 수 있음.
ci/cd 구축에 용이함.


## 2. Backend Dockerfile 설명
(각 명령이 무엇을 의미하는지 줄 단위로 설명)

` FROM gradle:8.5-jdk21 AS builder `  
gradle이 설치된 jda21환경에서 빌드

` WORKDIR /app `  
work directory는 /app

`COPY build.gradle settings.gradle ./`  
`COPY gradle ./gradle`  
해당 경로의 파일들을 복사

`RUN gradle dependencies --no-daemon || true`  
의존성 다운로드  

`COPY src ./src`  
src 폴더 폭사 (소스코드)  

`RUN gradle bootJar --no-daemon -x test`  
빌드 실행



`FROM eclipse-temurin:21-jre-jammy`  
실행에 필요한 환경 설정

`WORKDIR /app`  
작업 디렉토리 설정

`COPY --from=builder /app/build/libs/*.jar app.jar`  
윗 단계에서 빌드된 .jar 파일을 이미지로 복사

`EXPOSE 8080`  
포트 노출


`ENTRYPOINT ["java", "-jar", "app.jar"]`  
jar 파일 실행



## 3. Frontend Dockerfile 설명
<pre>
FROM node:20.11.1-alpine AS builder
-> alpine 에서 빌더 실행
-> ec2 pretier는 용량이 적기 때문에 가벼운 이미지를 사용

WORKDIR /app
-> 작업 디렉토리 설정


ARG NEXT_PUBLIC_API_URL=http://backend:8080
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
-> docker-compose에 작성된 서비스인 backend에 연결

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
-> package*.json 을 복사해서 npm을 사용할 수 있게.
-> npm 을 다운 받고 코드를 복사, 빌드

#실행
FROM node:20.11.1-alpine
WORKDIR /app

# 환경변수 전달
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]</pre>

## 4. docker-compose 역할
여러 컨테이너(서비스)를 compose에 엮어 의존성을 주입할 수 있음.
.env 파일 등으로 민감한 정보를 감출 수 있고 편리하게 이용 가능
여러 서비스를 한 번에 실행하거나 멈출 수 있음 (관리 용이)



# AWS 배포 설명

## 1. EC2를 선택한 이유
?


## 2. 보안 그룹 설정 이유
8080 - 백엔드 연결
3000 - 프론트 연결
22   - es2 연결

## 3. 서버에서 실행한 명령 흐름

## 4. 배포 후 접속 방식