## Blog

A "blog" project built using React, Spring Boot, and MySQL.

# Database

Upon starting the application, the `schema.sql` file located in `src/main/resources` will be executed. Please ensure that you have a database named "blog" prior to starting the application. If you need to change the database configuration, you can do so by modifying the `application.properties` file located in `src/main/resources`.

# Deploying to server

To deploy the application to a server, run the command `./mvnw spring-boot:run -P prod` or `mvn spring-boot:run -P prod`. This will build the frontend artifacts and start the server on `http://localhost:8080`.
