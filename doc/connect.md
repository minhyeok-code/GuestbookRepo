=========ec2에 접속 시도 중 에러

PS C:\> ssh -i C:/guest.pem ec2-uesr@3.26.27.206 The authenticity of host '3.26.27.206 (3.26.27.206)' can't be established. ED25519 key fingerprint is SHA256:/feX9GdXiqHFz8s4ZTbQ+bvHWapkrw4v9jMCQA2CnTI. This key is not known by any other names. Are you sure you want to continue connecting (yes/no/[fingerprint])? yes Warning: Permanently added '3.26.27.206' (ED25519) to the list of known hosts. Bad permissions. Try removing permissions for user: BUILTIN\\Users (S-1-5-32-545) on file C:/guest.pem. @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ @ WARNING: UNPROTECTED PRIVATE KEY FILE! @ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Permissions for 'C:/guest.pem' are too open. It is required that your private key files are NOT accessible by others. This private key will be ignored. Load key "C:/guest.pem": bad permissions ec2-uesr@3.26.27.206: Permission denied (publickey,gssapi-keyex,gssapi-with-mic).

pem file 에 권한이 너무 많기에 뜨는 에러.
window powershell 에 서는 권한변경 방법을 모르기 떄문에.. git bash를 이용하여 chmod 400 .pem 실행.
bash에서 접속 시도하니 해결 됨..