## Blog

A "blog" project built using React, Spring Boot, and MySQL.

# Database

Upon starting the application, the `schema.sql` file located in `src/main/resources` will be executed. Please ensure that you have a database named "blog" prior to starting the application. If you need to change the database configuration, you can do so by modifying the `application.properties` file located in `src/main/resources`.

# Setting up `JAVA_HOME`

To set up the `JAVA_HOME` environment variable, follow these steps:

1. Install the OpenJDK 17 package: `sudo apt install openjdk-17-jdk`
2. Edit the `/etc/environment` file: `sudo vi /etc/environment`
3. Add the following line to the file: `JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"`
4. Reload the environment variables: `source /etc/environment`

# Building the Application

To build the Spring Boot Blog application, run the following command in the project directory:

```
./mvnw clean package -P prod
```

This command will build the frontend artifacts and create a JAR file for the application.

# Deploying to a Server

To deploy the Spring Boot Blog application to a server, follow these steps:

1. Create a new Systemd service file: `sudo vi /etc/systemd/system/blog.service`
2. Add the following content to the service file:

```
[Unit]
Description=Spring Boot serve for blog app
After=network.target

[Service]
User=<username>
Group=www-data
WorkingDirectory=/home/<username>/Spring-Boot-Blog
Environment="PATH=/usr/bin"
Environment="SERVER_PORT=8001"
ExecStart=/usr/bin/java -jar /home/<username>/Spring-Boot-Blog/target/blog.jar

[Install]
WantedBy=multi-user.target
```

3. Reload the Systemd configuration: `sudo systemctl daemon-reload`
4. Start the blog service: `sudo systemctl start blog`
5. Enable the blog service to start automatically at boot time: `sudo systemctl enable blog`
