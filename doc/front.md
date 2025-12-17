# Frontend 스타일링 가이드

## 📁 파일 구조

```
frontend/app/
├── globals.css              # 전역 스타일 및 CSS 변수
├── layout.tsx               # 루트 레이아웃 (폰트, 메타데이터)
├── page.js                  # 메인 페이지
└── guestbook/components/
    ├── AddGuestBook.js      # 입력 폼 컴포넌트
    └── List.js              # 목록 컴포넌트
```

---

## 🎨 컬러 팔레트

| 변수명 | 색상 코드 | 용도 |
|--------|----------|------|
| `--background` | `#0f0f23` | 배경색 (다크 네이비) |
| `--foreground` | `#e8e6e3` | 기본 텍스트 |
| `--primary` | `#ff6b9d` | 주요 강조색 (핑크) |
| `--secondary` | `#c792ea` | 보조 강조색 (퍼플) |
| `--accent` | `#7ee8fa` | 액센트 (시안) |
| `--card-bg` | `#1a1a2e` | 카드 배경 |
| `--card-border` | `#2d2d44` | 카드 테두리 |
| `--input-bg` | `#16213e` | 입력 필드 배경 |
| `--success` | `#50fa7b` | 성공 표시 (그린) |

---

## 🔤 폰트

```tsx
// layout.tsx
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});
```

- **Space Grotesk**: 본문 및 제목용 산세리프 폰트
- **JetBrains Mono**: 코드 표시용 모노스페이스 폰트

---

## 🧩 주요 Tailwind 클래스 정리

### 레이아웃

| 클래스 | 설명 |
|--------|------|
| `min-h-screen` | 최소 높이를 뷰포트 전체로 |
| `max-w-2xl mx-auto` | 최대 너비 제한 + 가운데 정렬 |
| `py-12 px-4` | 상하 패딩 3rem, 좌우 패딩 1rem |
| `sm:px-6 lg:px-8` | 반응형 패딩 |

### 플렉스박스

| 클래스 | 설명 |
|--------|------|
| `flex` | 플렉스 컨테이너 |
| `items-center` | 세로 가운데 정렬 |
| `justify-center` | 가로 가운데 정렬 |
| `gap-2`, `gap-3`, `gap-4` | 아이템 간격 |
| `flex-shrink-0` | 축소 방지 |
| `flex-1` | 남은 공간 채우기 |

### 타이포그래피

| 클래스 | 설명 |
|--------|------|
| `text-4xl sm:text-5xl` | 반응형 폰트 크기 |
| `font-bold` | 굵은 글씨 |
| `font-semibold` | 준굵은 글씨 |
| `text-center` | 텍스트 가운데 정렬 |
| `leading-relaxed` | 넉넉한 줄 간격 |
| `break-words` | 긴 단어 줄바꿈 |

### 그라데이션 텍스트

```jsx
<h1 className="bg-gradient-to-r from-[#ff6b9d] via-[#c792ea] to-[#7ee8fa] bg-clip-text text-transparent">
  ✨ Guestbook
</h1>
```

| 클래스 | 설명 |
|--------|------|
| `bg-gradient-to-r` | 왼쪽에서 오른쪽으로 그라데이션 |
| `from-[#ff6b9d]` | 시작 색상 |
| `via-[#c792ea]` | 중간 색상 |
| `to-[#7ee8fa]` | 끝 색상 |
| `bg-clip-text` | 텍스트에만 배경 적용 |
| `text-transparent` | 텍스트 투명 (그라데이션 보이게) |

### 카드 스타일

```jsx
<div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-2xl p-6 sm:p-8 card-hover">
```

| 클래스 | 설명 |
|--------|------|
| `bg-[#1a1a2e]` | 커스텀 배경색 |
| `border border-[#2d2d44]` | 테두리 |
| `rounded-xl`, `rounded-2xl` | 둥근 모서리 |
| `p-6 sm:p-8` | 반응형 패딩 |
| `card-hover` | 커스텀 호버 효과 (globals.css) |

### 입력 필드

```jsx
<input className="w-full px-4 py-3 bg-[#16213e] border border-[#2d2d44] rounded-xl 
                  text-[#e8e6e3] placeholder-[#6a6a7a]
                  focus:outline-none focus:border-[#ff6b9d] input-focus
                  transition-colors duration-200" />
```

| 클래스 | 설명 |
|--------|------|
| `w-full` | 너비 100% |
| `placeholder-[#6a6a7a]` | 플레이스홀더 색상 |
| `focus:outline-none` | 포커스 시 아웃라인 제거 |
| `focus:border-[#ff6b9d]` | 포커스 시 테두리 색상 변경 |
| `transition-colors duration-200` | 색상 전환 애니메이션 |
| `resize-none` | textarea 크기 조절 비활성화 |

### 버튼

```jsx
<button className="w-full py-3 px-6 rounded-xl font-semibold text-white
                   bg-gradient-to-r from-[#ff6b9d] to-[#c792ea] 
                   hover:opacity-90 cursor-pointer
                   transition-all duration-300 btn-glow">
```

| 클래스 | 설명 |
|--------|------|
| `hover:opacity-90` | 호버 시 투명도 |
| `cursor-pointer` | 포인터 커서 |
| `cursor-not-allowed` | 비활성화 시 커서 |
| `btn-glow` | 커스텀 글로우 효과 |

### 아바타

```jsx
<div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff6b9d] to-[#c792ea] 
                flex items-center justify-center text-white font-bold shadow-lg">
  {nickname.charAt(0).toUpperCase()}
</div>
```

### 로딩 스피너

```jsx
<div className="w-8 h-8 border-4 border-[#ff6b9d] border-t-transparent rounded-full animate-spin"></div>
```

| 클래스 | 설명 |
|--------|------|
| `border-4` | 테두리 굵기 |
| `border-t-transparent` | 상단 테두리 투명 |
| `animate-spin` | 회전 애니메이션 |

---

## 🎭 커스텀 CSS 클래스 (globals.css)

### gradient-bg (배경 그라데이션)

```css
.gradient-bg {
  background: 
    radial-gradient(ellipse at 20% 20%, rgba(255, 107, 157, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(126, 232, 250, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(199, 146, 234, 0.08) 0%, transparent 70%),
    var(--background);
}
```

여러 개의 `radial-gradient`를 레이어링하여 부드러운 배경 효과 생성.

### card-hover (카드 호버 효과)

```css
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(255, 107, 157, 0.15);
}
```

마우스 오버 시 카드가 위로 살짝 떠오르면서 그림자 생성.

### btn-glow (버튼 글로우 효과)

```css
.btn-glow::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-glow:hover::before {
  left: 100%;
}
```

호버 시 빛이 왼쪽에서 오른쪽으로 스캔하는 효과.

### input-focus (입력 필드 포커스)

```css
.input-focus:focus {
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.3);
}
```

포커스 시 핑크색 글로우 효과.

### animate-fade-in-up (페이드인 애니메이션)

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
}
```

아래에서 위로 페이드인되는 애니메이션. 리스트 아이템에 `animation-delay`와 함께 사용하여 순차적 등장 효과.

```jsx
<li style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in-up">
```

---

## 📱 반응형 디자인

Tailwind의 반응형 접두사 사용:

| 접두사 | 최소 너비 | 설명 |
|--------|----------|------|
| (기본) | 0px | 모바일 |
| `sm:` | 640px | 작은 태블릿 |
| `lg:` | 1024px | 데스크탑 |

```jsx
// 예시: 반응형 패딩
<main className="py-12 px-4 sm:px-6 lg:px-8">

// 예시: 반응형 폰트 크기
<h1 className="text-4xl sm:text-5xl">
```

---

## 🔧 상태 관리 및 조건부 스타일링

### 비활성화 버튼 스타일

```jsx
<button
  disabled={!isFormValid || isSubmitting}
  className={`
    ${isFormValid && !isSubmitting
      ? 'bg-gradient-to-r from-[#ff6b9d] to-[#c792ea] hover:opacity-90 cursor-pointer'
      : 'bg-[#2d2d44] text-[#6a6a7a] cursor-not-allowed'
    }
  `}
>
```

### 빈 상태 UI

```jsx
if (guestbooks.length === 0) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">📭</div>
      <p className="text-[#6a6a7a]">아직 작성된 방명록이 없습니다</p>
    </div>
  );
}
```

---

## 💡 추가 팁

### 1. 커스텀 색상 사용

```jsx
// 방법 1: 직접 색상 코드
className="bg-[#1a1a2e] text-[#ff6b9d]"

// 방법 2: CSS 변수 (globals.css에 정의)
className="bg-[var(--card-bg)]"
```

### 2. 조건부 클래스 결합

```jsx
className={`base-classes ${condition ? 'active-classes' : 'inactive-classes'}`}
```

### 3. 그룹 호버

```jsx
<div className="group">
  <span className="group-hover:text-[#ff6b9d]">호버 시 색상 변경</span>
</div>
```

