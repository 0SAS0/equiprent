FROM eclipse-temurin:21-jdk

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN curl -L https://github.com/clojure/brew-install/releases/latest/download/linux-install.sh | bash
RUN clojure -P -M:run

CMD ["clojure", "-M:run"]
