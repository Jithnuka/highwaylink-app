# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# (optional but faster builds)
COPY pom.xml .
RUN mvn -DskipTests dependency:go-offline

COPY . .
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/highwaylink-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
