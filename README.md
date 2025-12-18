
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

