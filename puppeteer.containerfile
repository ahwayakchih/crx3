#
# Example build command:
# 	podman build -t puppeteer -f puppeteer.containerfile
#
FROM docker.io/node:alpine

# If set to values different than the ones used by Node.js (1000:1000 at the time of writing),
# `node2` group and user will be added and container can be run as that user:
#   podman run --user node2 -rm -it puppeteer
ARG UID=
ARG GID=

USER root

RUN apk add udev gtk+3.0 xorg-server ttf-freefont dbus xvfb xvfb-run chromium git\
	&& mkdir -p /etc/chromium/policies/managed\
	&& mkdir -p /etc/chromium/policies/recommended\
	&& chmod -R 777 /etc/chromium/policies

RUN test -n "${UID}" && test "${UID}" != $(id -u node)\
	&& addgroup -g ${GID} node2\
	&& adduser -u ${UID} -G node2 -s /bin/bash -D node2\
	&& cp -a /home/node /home/node2\
	&& chown -R node2:node2 /home/node2

ENV CHROME_BIN /usr/bin/chromium-browser
ENV CHROME_POLICIES /etc/chromium/policies

USER node:node

CMD xvfb-run /bin/sh -l
