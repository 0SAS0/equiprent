FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY . .

RUN curl -L https://github.com/clojure/brew-install/releases/latest/download/linux-install.sh | bash

RUN clj -T:build uber

CMD ["java","-jar","target/report-service-0.1.0.jar"]
