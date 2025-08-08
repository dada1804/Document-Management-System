# Build stage
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /workspace
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src src
RUN mvn -B -q clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app
# Install tools for thumbnail generation
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg libreoffice \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /workspace/target/document-management-system-1.0.0.jar app.jar
RUN mkdir -p /app/uploads
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"] 