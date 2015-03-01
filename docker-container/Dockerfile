FROM nodesource/trusty:0.12.0

RUN     apt-get update

# install ssh & autossh
RUN     apt-get install -y openssl build-essential xorg libssl-dev xfonts-75dpi fontconfig

# copy source directory
COPY    . /src

# Install app dependencies
RUN     cd /src; dpkg -i ./wkhtmltox-0.12.2.1_linux-trusty-amd64.deb
RUN     cd /src; npm install; npm install -g forever;

# expose express port
EXPOSE  3000

CMD ["sh", "/src/dockerstartup.sh"]
