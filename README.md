## Space Station

This is the backend of Space Station.
Most of our code is writtren for the API server, which is located in /src folder.

In order to launch this project, following requirements must be fulfilled:
1. Docker Compose is installed
2. all fields in .env are filled in
3. have sufficient permissions to use ports 80 & 443 
4. the domain name written in .env is valid

```
Once the above criteria are met, the following two commands can be used to launch the project.
sudo apt-get install -y docker docker-engine docker-compose
sudo docker-compose up -d  #Don't add the last -d if trying to run in the foreground
```
