====== page.js 상단에 'use client'를 기재하지 않아서 일어난 오류
Ecmascript file had an error
> 1 | import { useEffect, useState } from "react"
    |                     ^^^^^^^^
  2 | import AddGuestBook from "./guestbook/components/AddGuestBook";
  3 | import List from "./guestbook/components/List";
  4 |

You're importing a component that needs `useState`. This React Hook only works in a Client Component. To fix, mark the file (or its parent) with the `"use client"` directive.

 Learn more: https://nextjs.org/docs/app/api-reference/directives/use-client

--> 훅을 사용하거나 이벤트가 있는 경우에 next.js에서는 use client를 기재해야한다


======= 구조분해
D:\Guestbook\frontend\.next\dev\server\chunks\ssr\[root-of-the-server]__4916ff0e._.js: Invalid source map. Only conformant source maps can be used to find the original code. Cause: Error: sourceMapURL could not be parsed ⨯ TypeError: guestbooks.map is not a function at List (D:\Guestbook\frontend\.next\dev\server\chunks\ssr\[root-of-the-server]__4916ff0e._.js:110:30) { digest: '581462001' } GET / 500 in 369ms (compile: 217ms, render: 152ms)

중요 문장 ** ⨯ TypeError: guestbooks.map is not a function at List 
guestbooks가 배열이 아니란 뜻.

```
export default function List(guestbooks) {

                
  return (  
    <ul>
      {guestbooks.map((g) => (
        <li key={g.id}>
          <strong>{g.nickname}</strong>: {g.content}
        </li>
      ))}
    </ul>
  );
}
```
guestbooks를 구조분해하지 않고 그대로 전달 받으면 guestbooks는 {guestbooks:[]} 형태로 들어오게 된다.
이를 List({guestbooks}) 로 받아주면 [...guestbooks] 로 배열형태로 들어오게된다.


======DB <--> backend 연결 실패

Caused by: org.hibernate.HibernateException
Hibernate가 사용할 sql문을 명확하게 지정하지 않아서 일어나는 에러

-> properties.yml 파일 수정
spring:
  jpa:
    database-platform: org.hibernate.dialect.MySQL8Dialect


=======docker-compose 작성 오류
1. dbpassword 환경변수 파일 미작성

The "DB_PASSWORD" variable is not set. Defaulting to a blank string.

2. image이름 오류
image: mysql :8.0 --> image: mysql:8.0

3. backend dockerfile
build 후 docker compose up 을 한다...
build 후 생기는 jar파일 경로를 제대로 기재한다..


======= Backend 서버가 몇 초 뒤에 다운되는 문제 (2024-12-16)

### 증상
- `docker compose up -d` 실행 시 MySQL 컨테이너는 정상 실행
- Backend 서버가 시작 후 몇 초 뒤에 다운됨

### 원인 분석

**1. 데이터베이스 호스트명 불일치 (핵심 원인)**

| 파일 | 설정된 호스트명 |
|------|----------------|
| docker-compose.yml | `mysql` (서비스 이름) |
| application.yml | `guest-mysql` |

Docker Compose 네트워크에서 컨테이너들은 서비스 이름으로 통신한다.
`application.yml`에서 `guest-mysql`이라는 존재하지 않는 호스트로 연결을 시도하여 연결 실패.

**2. MySQL 준비 완료 전 Backend 시작**

`depends_on: mysql` 만으로는 MySQL 컨테이너가 "시작"된 것만 확인하고,
실제로 MySQL 서버가 연결을 받을 준비가 완료되었는지는 확인하지 않음.
MySQL 초기화(데이터베이스 생성, 사용자 생성 등)에는 약 10~30초가 소요됨.

### 수정 사항

**1. application.yml - 호스트명 수정**

```yaml
# 수정 전
spring:
  datasource:
    url: jdbc:mysql://guest-mysql:3306/guestbook

# 수정 후
spring:
  datasource:
    url: jdbc:mysql://mysql:3306/guestbook
```

**2. docker-compose.yml - healthcheck 및 depends_on condition 추가**

```yaml
# 수정 전
services:
  mysql:
    image: mysql:8.0
    environment:
      ...
    ports:
      - "3308:3306"

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/guestbook

# 수정 후
services:
  mysql:
    image: mysql:8.0
    environment:
      ...
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
```

### 핵심 개념 정리

**Docker Compose 네트워크**
- Docker Compose는 자동으로 네트워크를 생성하고, 각 서비스는 서비스 이름으로 DNS 해석됨
- 예: `mysql` 서비스는 `mysql`이라는 호스트명으로 접근 가능

**depends_on과 healthcheck의 차이**
- `depends_on`: 단순히 컨테이너 시작 순서만 보장
- `depends_on` + `condition: service_healthy`: 서비스가 실제로 준비될 때까지 대기
- `healthcheck`: 컨테이너 내부에서 서비스 상태를 주기적으로 확인

### 재빌드 후 실행 방법

```bash
# backend 재빌드 (application.yml 변경사항 반영)
cd backend
./gradlew clean bootJar

# docker compose 재시작
cd ..
docker compose down
docker compose up -d --build
```


======= POST 요청 시 500 에러 발생 (2024-12-16)

### 증상
- 프론트엔드에서 방명록 데이터 입력 후 제출
- 500 Internal Server Error 발생
- 콘솔 에러: `Failed to load resource: the server responded with a status of 500`
- `Error: 서버 응답 실패!` at `AddGuestBook.js:35:19`

### 원인 분석

**프론트엔드에서 id를 직접 생성해서 전송하는 문제**

| 구분 | 내용 |
|------|------|
| 프론트엔드 | `id: ++ids.current` 로 id를 1, 2, 3... 으로 직접 생성하여 전송 |
| 백엔드 엔티티 | `@GeneratedValue(strategy = GenerationType.IDENTITY)` 로 DB에서 AUTO_INCREMENT로 id 자동 생성 |

**충돌 발생 원리:**
1. JPA의 `save()` 메서드는 엔티티의 id 값을 확인하여 동작 방식을 결정
   - id가 `null` → INSERT (새 데이터 생성)
   - id가 존재 → SELECT 후 UPDATE 또는 INSERT 시도
2. 클라이언트에서 보낸 id(예: 1, 2)가 DB의 AUTO_INCREMENT 전략과 충돌
3. 이미 존재하는 id로 INSERT를 시도하거나, 존재하지 않는 id로 UPDATE를 시도하면서 오류 발생

### 수정 사항

**AddGuestBook.js - id 생성 로직 제거**

```javascript
// 수정 전
'use client'

import { useRef, useState } from "react"

function AddGuestBook({onAdd}){
    const [guestbook, setGuestBook] = useState({
        nickname: '',
        content: '',
    });
    const ids = useRef(0)  // ❌ 불필요한 id 관리

    // ...

    const handleSubmit = async() => {
        const newEntry = {
            ...guestbook,
            id: ++ids.current  // ❌ id를 직접 생성하여 전송
        }

        try{
            const response = await fetch('http://localhost:8080/api/book',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEntry),  // ❌ id가 포함된 데이터 전송
            })
        if (!response.ok){
            throw new Error('서버 응답 실패!');
        }

        onAdd(newEntry)  // ❌ 서버에서 생성된 id가 아닌 클라이언트 id 사용
        // ...
    }
}
```

```javascript
// 수정 후
'use client'

import { useState } from "react"  // ✅ useRef 제거

function AddGuestBook({onAdd}){
    const [guestbook, setGuestBook] = useState({
        nickname: '',
        content: '',
    });
    // ✅ ids useRef 제거

    // ...

    const handleSubmit = async() => {
        // ✅ newEntry 변수 제거, guestbook 직접 사용

        try{
            const response = await fetch('http://localhost:8080/api/book',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(guestbook),  // ✅ nickname, content만 전송
            })
        if (!response.ok){
            throw new Error('서버 응답 실패!');
        }

        const savedEntry = await response.json();  // ✅ 서버 응답에서 저장된 데이터 받기
        onAdd(savedEntry)  // ✅ 서버에서 생성된 id가 포함된 데이터 사용
        // ...
    }
}
```

### 핵심 개념 정리

**JPA save() 동작 방식**
- `save(entity)` 호출 시 엔티티의 id(식별자) 값으로 신규/기존 여부 판단
- id가 null이면 → `persist()` (INSERT)
- id가 존재하면 → `merge()` (SELECT 후 UPDATE 또는 INSERT)

**GenerationType.IDENTITY**
- 데이터베이스의 AUTO_INCREMENT 기능 사용
- INSERT 시점에 DB가 id를 자동 생성
- 클라이언트에서 id를 지정하면 충돌 발생

**프론트엔드-백엔드 데이터 흐름 (올바른 방식)**
1. 프론트엔드: nickname, content만 전송 (id는 전송하지 않음)
2. 백엔드: DB에서 id 자동 생성 후 저장
3. 백엔드: 저장된 엔티티 (id 포함) 응답으로 반환
4. 프론트엔드: 응답받은 데이터로 상태 업데이트