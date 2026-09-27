# WorkBridge Cloud

WorkBridge 데스크톱 앱의 암호화 파일 저장 서버입니다. 대화 원문과 암호화 비밀번호는 서버로 전송되지 않습니다. 서버가 저장하는 것은 암호화된 객체와 계정 메타데이터(이메일, 파일 이름, 크기, 체크섬, 생성 시각, 세션 해시)입니다.

이 서버는 **개인용 또는 소규모 self-hosted MVP**입니다. 공개 멀티테넌트 서비스로 쓰지 마세요. 현재 구현에는 로그인 rate limit, 이메일 인증, 사용자별 저장 용량 제한, 서버 측 로그아웃·세션 폐기, 스트리밍 업로드가 없습니다. 업로드는 요청 본문을 메모리에 모은 뒤 디스크에 씁니다(최대 약 520 MB).

## 실행

Node.js 20 이상이 필요합니다.

```bash
chmod +x cloud/start.sh
WORKBRIDGE_CLOUD_HOST=127.0.0.1 \
WORKBRIDGE_CLOUD_PORT=8787 \
WORKBRIDGE_CLOUD_DATA=/var/lib/workbridge-cloud \
./cloud/start.sh
```

상태 확인:

```bash
curl http://127.0.0.1:8787/health
```

Docker로 실행할 수도 있습니다:

```bash
docker build -t workbridge-cloud cloud
docker run -d --name workbridge-cloud -p 127.0.0.1:8787:8787 -v workbridge-cloud-data:/data workbridge-cloud
```

## 원격 배포

서버는 기본적으로 HTTP를 제공합니다. 인터넷에 직접 노출하지 마세요. Caddy, Nginx 또는 호스팅 플랫폼의 TLS 프록시 뒤에서 실행하고, 앱 설정에는 `https://` 주소를 입력하세요.

다음 경로를 영구 볼륨에 연결하세요:

- `WORKBRIDGE_CLOUD_DATA/cloud.json`: 계정, 세션, 파일 메타데이터
- `WORKBRIDGE_CLOUD_DATA/objects/`: 암호화된 대화 파일

백업 시 두 항목을 같은 시점에 보관하세요. 계정 비밀번호는 scrypt 해시로 저장되고, 로그인 세션은 원문이 아닌 SHA-256 해시로 저장됩니다.

## 환경 변수

- `WORKBRIDGE_CLOUD_HOST`: 수신 주소. 기본값 `127.0.0.1`
- `WORKBRIDGE_CLOUD_PORT`: 포트. 기본값 `8787`
- `WORKBRIDGE_CLOUD_DATA`: 영구 데이터 디렉터리. 기본값 `./workbridge-cloud-data`

인터넷에 직접 노출하지 마세요. 공개 서비스로 운영하려면 HTTPS 리버스 프록시, 백업, 접근 로그 보호, 용량 제한, 인증 강화, 개인정보 처리방침이 필요합니다. 다중 서버 운영에는 관리형 데이터베이스와 객체 스토리지로 저장 계층을 교체하세요.
