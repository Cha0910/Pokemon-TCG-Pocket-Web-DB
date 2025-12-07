## 포켓몬 카드 게임 Pocket DB 웹 서비스

이 프로젝트는 **AWS Serverless 아키텍처**를 활용하여 구현된 
**포켓몬 카드게임 Pocket의 카드/덱 관리 웹 서비스**입니다. 
사용자는 카드 데이터를 검색하고, 자신의 카드 보유 데이터를 저장하며, 
이를 기반으로 원하는 덱을 구성할 수 있는지 확인하는 기능을 제공합니다.

개발 인원: 1인

개발 기간: 2024.11 ~ 2024.12

![메인 화면](/src/assets/docs/home.png)

> **🚨 중요 공지:** 이 프로젝트의 **백엔드 서버는 현재 운영되지 않습니다.**
>따라서 라이브 데모는 제공되지 않으며, 로컬에서 프로젝트를 실행해도 **API 호출 관련 기능은 작동하지 않습니다.**

-----

## 주요 기능

**1. 카드 데이터 검색:** 카드 이름, 최대/최소 HP, 후퇴 에너지, 타입 등을 기준으로 카드를 검색하고 결과를 출력합니다.

**2. 사용자 인증:** **AWS Cognito Hosted UI**를 통한 로그인 및 회원가입 기능을 구현하였습니다.

**3. 보유 카드 관리:** 로그인 후 유저 페이지에서 사용자가 보유한 카드 정보를 조회하며, CSV 파일을 업로드하거나 카드 수량 버튼을 통해 보유 정보를 업데이트합니다.

**4. 덱 리스트 조회:** 저장된 덱 리스트를 티어 순으로 정렬하여 표시하며 , 메인 카드 ID를 통해 상세 덱 정보를 조회합니다.

**5. 덱 구성 가능 여부:** 덱 상세 페이지에서 사용자 보유 카드와 덱 구성 카드를 비교하여, **미보유 카드는 흑백**으로, 보유 카드는 컬러로 시각화하여 출력합니다.

![비회원 덱 구성](/src/assets/docs/deck_1.png)

-----

## 문제 및 해결

### 1. 커스텀 Cognito 인증 흐름 구현

* **문제:** AWS Amplify를 사용한 간편한 Cognito 연동이 개발 환경 제약으로 인해 불가능했습니다.
* **해결:**
  * **Authorization Code 추출:** Vue 코드(`App.vue`)에서 로그인 후 리다이렉트 된 URL의 `Authorization Code`를 직접 추출했습니다.
  * **토큰 교환:** 추출한 코드를 Cognito에 전달하여 `ID Token`을 교환하는 로직을 프론트엔드에서 구현했습니다.
  * **JWT 인증 처리:** 교환된 Token을 API 요청 헤더에 추가하고, **AWS Lambda 함수** 내부에 **JWT 디코딩 및 Claims 처리 로직**을 구현하여 토큰 기반 인증 및 권한 관리를 자체적으로 처리했습니다.

### 2. CORS(Cross-Origin Resource Sharing) 문제 해결

* **문제:** 사이트 구축 후 API 호출 시 CORS 에러가 발생했습니다.
* **해결:**
  * **API Gateway 설정:** API Gateway 엔드포인트에 CORS를 활성화하고, 각 리소스의 메소드 응답에 `Access-Control-Allow-Headers`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Origin: '*'` 헤더를 추가했습니다.
  * **Lambda 응답 설정:** Lambda 함수 응답에도 동일한 CORS 헤더를 추가하여 문제를 해결했습니다.

-----

## 📂 프로젝트 구조

<details>
<summary> 1. 📂 Pokemon-TCG-Pocket-Web-DB </summary>

| 파일 | 역할 및 내용 |
| :--- | :--- |
| **`package.json`** | 프로젝트에 필요한 모든 **종속성** 및 실행/빌드 스크립트 정의 |
| **`index.html`** | Vue 애플리케이션이 로드되는 **기본 HTML 파일** |
| **`vite.config.js`** | **Vite 빌드 도구** 설정을 정의합니다. |
</details>

<details>
<summary>  2. 📂 `src/` (Root Files) </summary>

| 파일 | 역할 및 내용 |
| :--- | :--- |
| **`App.vue`** | **메인 레이아웃** 컴포넌트이며, **Cognito Hosted UI**를 통한 인증 로직을 포함합니다. |
| **`main.js`** | Vue 앱 인스턴스 생성 및 Pinia, Router 등 **핵심 라이브러리를 등록**하여 앱을 초기화합니다. |

</details>

<details>
<summary> 3. 📂 `src/views/` (라우팅 페이지 컴포넌트) </summary>

| 파일 | 역할 및 내용 |
| :--- | :--- |
| **`Home.vue`** | **[카드 검색 및 조회 메인 페이지]** 카드 이름, HP, 타입 등을 기준으로 검색하는 주요 사용자 인터페이스입니다. |
| **`DeckPage.vue`** | **[덱 목록 페이지]** 저장된 덱 리스트를 **티어 순**으로 정렬하여 표시합니다. |
| **`DeckList.vue`** | **[덱 상세 페이지]** 특정 덱의 구성 정보를 출력하며, **보유/미보유 카드를 시각화**하는 로직이 포함됩니다. |
| **`UserPage.vue`** | **[사용자 보유 카드 관리 페이지]** 로그인 후 유저의 보유 카드 정보를 조회하고 업데이트하는 기능을 제공합니다. |

</details>

<details>
<summary>  4. 📂 `src/router/` (경로 설정) </summary>

| 파일 | 역할 및 내용 |
| :--- | :--- |
| **`index.js`** | **Vue Router** 설정 및 애플리케이션의 모든 경로(Path) 정의를 담당합니다. |

</details>

<details>
<summary> 5. 📂 `src/utils/` (핵심 모듈 및 공통 기능) </summary>

| 파일 | 역할 및 내용 |
| :--- | :--- |
| **`apiClient.js`** | **Axios 인스턴스**를 정의하고, **Cognito 인증 토큰 인터셉터**를 설정하여 API 통신을 담당합니다. |
| **`auth.js`** | **Pinia Auth Store**를 정의하여 사용자 인증 상태(로그인 여부, 토큰)를 전역적으로 관리합니다. |

</details>

<details>
<summary>  6. 📂 `src/assets/` 및 `src/components/` </summary>

| 폴더 | 역할 및 내용 |
| :--- | :--- |
| **`assets/`** | CSS, 이미지, 폰트 등 프로젝트 내부에서 사용되는 **정적 리소스**를 저장합니다. |
| **`components/`** | 버튼, 카드 썸네일 등 여러 페이지에서 재사용되는 **UI 컴포넌트**를 모듈화하여 관리합니다. |

</details>

-----

## 시스템 아키텍처

프로젝트는 API Gateway, Lambda, DynamoDB를 중심으로 하는 **서버리스 아키텍처**를 채택했습니다.

![비회원 덱 구성](/src/assets/docs/architecture.png)

* 사용자의 요청(User)은 **API Gateway**를 통해 **AWS Lambda**로 전달됩니다.
* Lambda는 비즈니스 로직을 처리하고 **DynamoDB**에서 카드 및 사용자 정보를 읽거나 씁니다.
* 카드 이미지와 같은 정적 콘텐츠는 **S3**에 저장되어 관리됩니다.
* **Cognito**는 사용자 인증을 전담하여 API 호출 권한을 관리합니다.

-----

## 설치 및 실행 방법

```bash
# GitHub 저장소 클론
git clone https://github.com/Cha0910/Pokemon-TCG-Pocket-Web-DB.git
cd Pokemon-TCG-Pocket-Web-DB

# 의존성 설치
npm install
# 또는 yarn install

# 개발 서버 실행
npm run dev
# 또는 yarn dev
```

* **주의:** API 서버가 비활성화되어 API 호출을 포함한 핵심 기능은 로컬에서 작동하지 않습니다.

-----

## 기술 스택

###  프론트엔드 (SPA)

* **Vue.js 3:** 싱글 페이지 애플리케이션(SPA) 구현.
* **Vue Router:** 클라이언트 측 라우팅 정의.
* **Axios:** 백엔드 API와의 통신을 위한 HTTP 클라이언트.

###  백엔드 (AWS Serverless)

| 서비스 | 역할 |
| :--- | :--- |
| **AWS Lambda** | 서버리스 백엔드 로직 구축 및 API 처리. |
| **Amazon API Gateway** | 프론트엔드와 Lambda를 연결하는 RESTful API 엔드포인트 구현. |
| **Amazon DynamoDB** | 카드, 덱, 유저의 정보를 저장하는 NoSQL 데이터베이스. |
| **Amazon S3** | 카드 이미지 및 Vue 빌드 파일 저장. |
| **Amazon Cognito** | 사용자 인증 및 권한 관리. |
| **Amazon CloudWatch** | 로그 확인 및 문제 원인 분석. |