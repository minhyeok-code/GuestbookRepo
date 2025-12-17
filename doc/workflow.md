# GitHub Actions Workflow 문제 분석 및 해결

## 🔍 발견된 문제점

### 1. ❌ 존재하지 않는 Spring Boot Starter 의존성 (핵심 원인)

**파일:** `backend/build.gradle`

```gradle
// 문제가 있던 의존성들
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-webmvc'        // ❌ 존재하지 않음!
    testImplementation 'org.springframework.boot:spring-boot-starter-data-jpa-test'  // ❌ 존재하지 않음!
    testImplementation 'org.springframework.boot:spring-boot-starter-webmvc-test'    // ❌ 존재하지 않음!
}
```

**문제:** 위 의존성들은 Maven Central에 존재하지 않습니다!
- `spring-boot-starter-webmvc` → 올바른 이름: `spring-boot-starter-web`
- `spring-boot-starter-data-jpa-test` → 존재하지 않음
- `spring-boot-starter-webmvc-test` → 존재하지 않음, `spring-boot-starter-test` 사용

**해결:**
```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-web'  // ✅ 올바른 이름
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    developmentOnly 'org.springframework.boot:spring-boot-devtools'
    runtimeOnly 'com.mysql:mysql-connector-j'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'  // ✅ 올바른 이름
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

// plain jar 생성 비활성화 (중요!)
tasks.named('jar') {
    enabled = false
}
```

---

### 2. ❌ Gradle 버전 불일치

**파일:** `backend/gradle/wrapper/gradle-wrapper.properties`

```properties
# 문제: Gradle 9는 Spring Boot 3.4와 호환성 문제 가능
distributionUrl=https\://services.gradle.org/distributions/gradle-9.2.1-bin.zip
```

**해결:**
```properties
# Gradle 8.5 사용 (안정적인 버전)
distributionUrl=https\://services.gradle.org/distributions/gradle-8.5-bin.zip
```

---

### 3. ❌ Plain JAR 충돌 문제

**문제:** Spring Boot는 기본적으로 두 개의 JAR 파일을 생성합니다:
- `simpleproject-0.0.1-SNAPSHOT.jar` (실행 가능한 Fat JAR)
- `simpleproject-0.0.1-SNAPSHOT-plain.jar` (실행 불가능한 일반 JAR)

Dockerfile에서 `COPY --from=builder /app/build/libs/*.jar app.jar` 실행 시 두 파일이 충돌!

**해결:** `build.gradle`에 plain jar 비활성화 추가
```gradle
tasks.named('jar') {
    enabled = false
}
```

---

### 2. ❌ docker-compose.yml의 build vs image 불일치

**문제:**
- Workflow에서 Docker Hub에 이미지를 푸시: `choiminhyeok/backend-app:latest`
- 하지만 docker-compose.yml에서는 `build: ./backend`로 로컬 빌드를 시도

```yaml
# 현재 설정 - 문제!
backend:
  build: ./backend  # 로컬에서 빌드 시도
  
frontend:
  build: ./frontend  # 로컬에서 빌드 시도
```

**결과:** EC2에서 `docker compose up -d` 실행 시:
1. Docker Hub에서 pull한 이미지를 무시
2. 로컬에서 직접 빌드 시도 → 시간 소요 + 빌드 실패 가능

**해결:** EC2용 docker-compose 파일 분리 또는 image 태그 사용

```yaml
# docker-compose.yml (EC2 배포용)
backend:
  image: choiminhyeok/backend-app:latest  # Docker Hub 이미지 사용
  
frontend:
  image: choiminhyeok/frontend-app:latest  # Docker Hub 이미지 사용
```

---

### 3. ❌ DB_PASSWORD 환경변수 미설정

**문제:** docker-compose.yml에서 `${DB_PASSWORD}`를 사용하지만, EC2에서 해당 환경변수가 설정되지 않음

```yaml
environment:
  MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}  # 환경변수가 없으면 빈 값!
```

**해결 방법 1:** EC2에서 환경변수 설정
```bash
export DB_PASSWORD=yourpassword
```

**해결 방법 2:** .env 파일 생성 (권장)
```bash
# EC2에서 .env 파일 생성
echo "DB_PASSWORD=yourpassword" > ~/guestbook/.env
```

**해결 방법 3:** GitHub Secrets로 .env 파일 생성 (workflow에서)
```yaml
script: |
  cd ~/guestbook
  echo "DB_PASSWORD=${{ secrets.DB_PASSWORD }}" > .env
  docker compose up -d
```

---

### 4. ⚠️ NEXT_PUBLIC_API_URL 설정 문제

**문제:**
```yaml
environment:
  NEXT_PUBLIC_API_URL: http://localhost:8080
```

- `localhost`는 EC2 서버 자체를 가리킴
- 브라우저에서 접근 시 사용자의 로컬 PC를 가리키게 됨 → API 호출 실패

**해결:** EC2의 Public IP 또는 도메인 사용
```yaml
environment:
  NEXT_PUBLIC_API_URL: http://<EC2_PUBLIC_IP>:8080
  # 또는
  NEXT_PUBLIC_API_URL: http://yourdomain.com:8080
```

**주의:** `NEXT_PUBLIC_*` 환경변수는 빌드 시점에 주입됩니다!
런타임에 변경하려면 Docker 빌드 시 ARG로 전달하거나, 클라이언트에서 동적으로 처리해야 합니다.

---

### 5. ⚠️ Workflow 실행 순서 문제

**현재 workflow:**
```yaml
- name: Build and push backend image
  # ... backend 빌드

- name: Build and push frontend image
  # ... frontend 빌드

- name: Deploy on EC2
  # ... EC2 배포
```

**잠재적 문제:**
- EC2에서 `git clone` 후 `docker compose up -d` 실행
- 하지만 docker-compose.yml이 `build:` 사용 시 로컬 빌드 시도
- EC2에서 Gradle/Node.js 빌드는 메모리/시간 문제 발생 가능

---

## ✅ 권장 수정 사항

### 1. build.gradle 수정

```gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.4.1'  // 유효한 버전으로 수정
    id 'io.spring.dependency-management' version '1.1.7'
}
```

### 2. docker-compose.prod.yml 생성 (배포용)

```yaml
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
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${DB_PASSWORD}"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 30s
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    image: choiminhyeok/backend-app:latest
    ports:
      - "8080:8080"
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/guestbook
      SPRING_DATASOURCE_USERNAME: guestuser
      SPRING_DATASOURCE_PASSWORD: guest1234

  frontend:
    image: choiminhyeok/frontend-app:latest
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mysql_data:
```

### 3. Workflow 수정

```yaml
- name: Deploy on EC2
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.EC2_HOST }}
    username: ec2-user
    key: ${{ secrets.EC2_KEY }}
    script: |
      # Docker 설치 확인
      if ! command -v docker &> /dev/null; then
        sudo yum install docker -y
        sudo systemctl start docker
        sudo usermod -aG docker ec2-user
      fi
      
      # Docker Compose 설치 확인
      if ! command -v docker-compose &> /dev/null; then
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
      fi
      
      # 기존 컨테이너 정리
      cd ~/guestbook 2>/dev/null && docker compose down || true
      
      # 저장소 클론/업데이트
      rm -rf ~/guestbook
      git clone https://minhyeok-code:${{ secrets.PAT_KEY }}@github.com/minhyeok-code/guestbook.git ~/guestbook
      cd ~/guestbook
      
      # 환경변수 설정
      echo "DB_PASSWORD=${{ secrets.DB_PASSWORD }}" > .env
      
      # 최신 이미지 pull
      docker pull choiminhyeok/backend-app:latest
      docker pull choiminhyeok/frontend-app:latest
      
      # 배포용 compose 파일로 실행
      docker compose -f docker-compose.prod.yml up -d
```

### 4. Frontend Dockerfile 수정 (API URL 빌드 시 주입)

```dockerfile
FROM node:20.11.1-alpine AS builder
WORKDIR /app

# 빌드 시 API URL 주입
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20.11.1-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
CMD ["node", "server.js"]
```

Workflow에서 빌드 시 ARG 전달:
```yaml
- name: Build and push frontend image
  uses: docker/build-push-action@v5
  with:
    context: ./frontend
    file: ./frontend/Dockerfile
    push: true
    tags: choiminhyeok/frontend-app:latest
    build-args: |
      NEXT_PUBLIC_API_URL=http://${{ secrets.EC2_HOST }}:8080
```

---

## 📋 필수 GitHub Secrets 목록

| Secret 이름 | 설명 | 예시 |
|-------------|------|------|
| `DOCKER_USERNAME` | Docker Hub 사용자명 | choiminhyeok |
| `DOCKER_PASSWORD` | Docker Hub 비밀번호/토큰 | dckr_pat_xxx |
| `EC2_HOST` | EC2 Public IP | 13.xxx.xxx.xxx |
| `EC2_KEY` | EC2 SSH Private Key | -----BEGIN RSA... |
| `PAT_KEY` | GitHub Personal Access Token | ghp_xxx |
| `DB_PASSWORD` | MySQL Root 비밀번호 | securepassword123 |

---

## 🔧 문제 해결 체크리스트

- [ ] `build.gradle`의 Spring Boot 버전을 `3.4.1`로 수정
- [ ] `docker-compose.prod.yml` 생성 (image 태그 사용)
- [ ] GitHub Secrets에 `DB_PASSWORD` 추가
- [ ] Workflow에서 `docker-compose.prod.yml` 사용하도록 수정
- [ ] Frontend API URL을 EC2 IP로 설정
- [ ] EC2 보안 그룹에서 포트 3000, 8080 열기

---

## 🚨 빌드 실패 시 디버깅

### GitHub Actions 로그 확인
1. GitHub 저장소 → Actions 탭
2. 실패한 workflow 클릭
3. 각 step의 로그 확인

### 일반적인 에러 메시지

| 에러 | 원인 | 해결 |
|------|------|------|
| `Plugin not found: org.springframework.boot:4.0.0` | 존재하지 않는 버전 | 3.4.1로 변경 |
| `COPY failed: file not found` | 빌드 결과물 없음 | 빌드 명령 확인 |
| `Cannot connect to mysql` | DB 미실행/연결 설정 오류 | healthcheck 및 depends_on 확인 |
| `permission denied` | Docker 권한 없음 | `sudo usermod -aG docker ec2-user` |

