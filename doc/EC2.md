======ec2에 깔아야하는 것들..
sudo yum update -y
yum을 일단 업데이트..

git
sudo yum install git -y

docker
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker


docker compose
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

docker compose version 을 통해 버전을 확인하자.. 0.13 이하로는 연동안된다...



 java..필요없음.. spring을 통해 바로 서버를 올리는 것이 아니기 때문..

 ========인스턴스 보안 인바운드 규칙

 custom TCP 3000 /// 0.0.0.0  --> front는 3000번에서 접근하고 있기 때문에 이 규칙을
 추가하지 않으면 접속이 안됨..ㅠㅠ

