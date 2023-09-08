# Blog

A blogging website built with **React**, **SpringBoot**, and **MySQL**. Live link: https://blog.aaronhong.net

## Database

Upon starting the application, the `schema.sql` file located in `src/main/resources` will be executed. Please ensure that you have a database named "blog" prior to starting the application. If you need to change the database configuration, you can do so by modifying the `application.properties` file located in `src/main/resources`.

## Setting up `JAVA_HOME`

To set up the `JAVA_HOME` environment variable, follow these steps:

Install the OpenJDK 17 package: 

```shell
sudo apt install openjdk-17-jdk
```

Add `JAVA_HOME` to the `/etc/environment` file: 

```shell
echo 'JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"' | sudo tee -a /etc/environment
```

Reload the environment variables: 

```shell
source /etc/environment
```

## Building the Application

To build the Spring Boot Blog application, run the following command in the project directory:

```shell
./mvnw clean package -P prod
```

This command will build the frontend artifacts and create a JAR file for the application.

## Deploying to a Server

To deploy the Spring Boot Blog application to a server, follow these steps:

Create a new Systemd service file: 

```shell
sudo vi /etc/systemd/system/blog.service
```

Add the following content to the service file:

```shell
[Unit]
Description=Spring Boot serve for blog app
After=network.target

[Service]
User=<username>
Group=www-data
WorkingDirectory=/home/<username>/blog
Environment="PATH=/usr/bin"
ExecStart=/usr/bin/java -jar /home/<username>/blog/target/blog.jar

[Install]
WantedBy=multi-user.target
```

Start and enable the blog service: 

```shell
sudo systemctl daemon-reload
sudo systemctl start blog
sudo systemctl enable blog
```

Install nginx:

```shell
sudo apt install nginx
```

Create nginx config file

```shell
sudo vi /etc/nginx/sites-available/blog
```

Add the following content to the config file:

```shell
server {
    listen 80;
    server_name <IP address or domain name>;

    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name <IP address or domain name>;

    error_log /home/ubuntu/portfolio/error.log;
    access_log /home/ubuntu/portfolio/access.log;

    ssl_certificate <Path to cert>;
    ssl_certificate_key <Path to key>;

    location / {
        include proxy_params;
        proxy_pass <Port or Stock>;
    }
}
```

Soft link conf files and restart nginx

```shell
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
sudo nginx -s reload
```
