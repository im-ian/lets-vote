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

1. 소켓 서버 직접 구현 [(링크)](https://github.com/im-ian/lets-vote/blob/main/server.ts)
  - **장점**: 기존에 모호했던 소켓 통신의 전체 흐름(emit/on, room, broadcast)을 조금 더 자세히 알게된 계기가 된 것 같습니다. 프론트엔드에서 필요한 이벤트와 데이터 구조를 직접 설계할 수 있어서 빠르게 구현할 수 있던 것 같습니다.
  - **단점**: 프론트엔드 기준으로 코드를 빠르게 작성하다보니 나중에 확장성 등의 프로덕션 레벨의 고려사항을 놓치고 있었다는 것을 프로젝트를 마무리 할때쯤 알게되었어요. 좋은 코드를 위해 당연히 고민했어야할 부분을 놓친 것 같아 아쉬웠어요.
2. React Context API를 사용한 Socket client 싱글톤 유지 [(링크)](https://github.com/im-ian/lets-vote/blob/main/src/components/providers/SocketProvider.tsx)
  - **장점**: 전역 상태로 소켓 인스턴스를 관리하여 컴포넌트 어디서든 `useSocket()` 훅으로 간편하게 접근 가능했고, 연결 상태(isConnected)를 React 상태로 관리해 UI에 즉시 반영할 수 있었어요. 앱 최상위에서 한 번만 연결/해제를 관리하니 생명주기 관리가 명확했습니다.
  - **단점**: 소켓 이벤트 리스너가 컴포넌트마다 등록/해제되다 보니 cleanup 로직을 빠뜨리기 쉬웠던 것 같습니다. `useSocketEvent` 등의 훅을 만들어 관리했으면 어떨까하는 생각이 생긴 것 같습니다. [(PR링크)](https://github.com/im-ian/lets-vote/pull/1/files)
3. 투표 시간 동기화(타이머 동기화), 투표 도중에 투표룸에 들어온 사용자들도 함께 투표할 수 있도록 했어요. [(링크)](https://github.com/im-ian/lets-vote/blob/main/src/RoomPage.tsx#L180-L196)
  - **장점**: 서버의 `voteStartedAt` 시간을 기준으로 경과 시간을 계산하는 방식으로, 중간에 입장한 사용자도 정확한 남은 시간을 확인할 수 있었어요. 어떻게 보면 사용성이 증가한 것 같아서 구현 후 만족스러웠던 것 같아요.
  - **단점**: 네트워크 지연 등으로 인해서 1초 정도의 오차가 발생하는 경우가 있던 것 같아요. 투표 시작 시간이 아닌 투표 종료시간을 전달하면 차이를 줄여볼 수 있지 않을까? 라는 생각이 있어요.
