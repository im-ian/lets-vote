# 🗳️ Let's Vote!

`socket.io-client`를 사용하여 구현한 투표 웹앱입니다.

친구들과의 게임이나 회사 안에서 간단한 투표 시에 활용해보세요 😎


## 🎮 기능 소개

### 📋 로비

<table>
  <tr>
    <td><img width="379" height="574" alt="image" src="https://github.com/user-attachments/assets/50a33ab9-96d0-49b2-9224-1f9f0b6c95ab" />
</td>
    <td><img width="379" height="574" alt="image" src="https://github.com/user-attachments/assets/6a4629bc-3ebb-409c-8c6e-f27b898b7c2d" />
</td>
    <td><img width="379" height="574" alt="image" src="https://github.com/user-attachments/assets/023b0b9e-f9fd-4b05-90d3-98c89d6ceb55" />
</td>
    <td><img width="379" height="574" alt="image" src="https://github.com/user-attachments/assets/b0070130-5045-4d7e-a71d-b853bc1e8486" />
</td>
  </tr>
</table>

- 📋 이미 생성된 투표룸들을 편하게 볼 수 있어요.
- ✏️ 왼쪽 위의 본인 프로필을 클릭하여 나만의 개성있는 이름을 설정할 수 있어요.
- 🏠 방을 대표하는 이름과 방에 들어오기 위해 필요한 패스워드를 설정하여 투표룸을 생성할 수 있어요.
- 🔐 사용자는 투표룸에 설정된 비밀번호를 입력하여 투표룸에 들어올 수 있어요.


### 🏠 투표룸

<table>
  <tr>
    <td><img width="379" height="574" alt="image" src="https://github.com/user-attachments/assets/a73fdafb-4d4a-454f-a896-c4492828edf3" /></td>
    <td><img width="379" height="574" alt="image" src="https://github.com/user-attachments/assets/6d102a82-3264-4743-97ee-b9b21ddc5629" />
</td>
    <td><img width="379" height="574" alt="image" src="https://github.com/user-attachments/assets/09557865-14a8-4a4e-975a-38edfd6bd1f6" />
</td>
    <td><img width="379" height="574" alt="image" src="https://github.com/user-attachments/assets/f0fb2963-2ac6-43d7-b6d1-df6bb49d782d" />
</td>
  </tr>
</table>

- 🗳️ 방장이 투표를 시작하면 제한된 시간 내에 투표 항목을 눌러 투표해주세요.
- 🏆 제한시간이 지나면 다른 사용자들에게 투표의 결과가 보여집니다.
- ⚙️ 투표룸의 다양한 설정을 통해 재미를 더해보세요!
- ✍🏻 사용자 목록 뿐만 아니라 내가 원하는 투표 항목을 만들어 투표해보세요.


## 🚀 실행 방법

```bash
git clone https://github.com/im-ian/lets-vote
```
우선 프로젝트를 clone 받습니다.

```shell
cp .env.example .env
vi .env
```
우선 필요한 env를 위 명령어를 통해 복제해주세요.
이후 .env의 파일의 내용을 채워넣습니다. 만약 아무 내용이 없더라도 기본 값으로 실행될꺼에요!

```shell
# 웹 클라이언트 실행
npm run dev
# 소켓 서버 실행
npx run start:server
```
만약 env 설정 없이 기본 값으로 실행하셨다면 `http://localhost:3001` 주소로 접속해보세요!


## 📖 프로젝트 제작 목적

지인들과 제작하는 사이드 프로젝트에 실시간으로 해당 상품을 보고 있는 사용자의 수, 가격 변동을 표시하기 위해서 소켓을 사용하기로 했어요.

소켓 클라이언트 자체는 이전의 회사에서 채팅 서비스를 만들어 구현해본 경험이 있지만 이번에는 몇가지 새로운 시도를 해보고 싶었어요.

- 소켓 서버 직접 구현
- React Context API를 사용한 Socket client 싱글톤 유지
- 투표 시간 동기화(타이머 동기화), 투표 도중에 투표룸에 들어온 사용자들도 함께 투표할 수 있도록 했어요.
