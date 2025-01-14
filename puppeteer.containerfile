#
# Example build command:
# 	podman build -t puppeteer -f puppeteer.containerfile
#
FROM docker.io/node:alpine

USER root

RUN apk add udev gtk+3.0 xorg-server ttf-freefont dbus xvfb xvfb-run chromium\
	&& mkdir -p /etc/chromium/policies/managed\
	&& mkdir -p /etc/chromium/policies/recommended\
	&& chmod -R 777 /etc/chromium/policies

ENV CHROME_BIN /usr/bin/chromium-browser
ENV CHROME_POLICIES /etc/chromium/policies

USER node:node

CMD xvfb-run /bin/sh -l
