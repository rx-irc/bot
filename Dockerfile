FROM node:14-buster
MAINTAINER Florian Mäder <florian@maederbiel.ch>

# Limit Debian during build.
ARG DEBIAN_FRONTEND=noninteractive

# Set Node environment.
ENV NODE_ENV=production

# Default the timezone to Zürich.
ENV TZ=Europe/Zurich

# cowsay and fortune are installed into /usr/games/.
ENV PATH="/usr/games:${PATH}"

# Update system and install dependencies.
RUN apt-get update && \
	apt-get upgrade -y && \
	apt-get install -y \
		build-essential \
		libicu-dev \
		cowsay \
		figlet \
		fortunes && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/*

# Install additional figlet fonts.
WORKDIR /usr/share/figlet
RUN curl -o contributed.tar.gz ftp://ftp.figlet.org/pub/figlet/fonts/contributed.tar.gz && \
	tar --strip-components=1 -xzf contributed.tar.gz && \
	rm contributed.tar.gz

# Create user account.
# https://askubuntu.com/a/94067
RUN adduser rxbot \
	--disabled-password \
	--disabled-login \
	--gecos ""

# Switch working directory.
WORKDIR /home/rxbot

# Copy source code.
COPY app/ ./app/
COPY package.json package-lock.json* ./

# Set file permissions.
RUN chown -R rxbot:rxbot .

# Switch user.
USER rxbot

# Install dependencies.
# Development dependencies will not be installed
# because NODE_ENV is set to production.
RUN npm install

# Copy the configuration
# As most builds are because of the configuration, we add it last.
COPY config.json .

CMD ["npm", "start"]
