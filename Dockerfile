FROM node:10-alpine

WORKDIR /opt/app
COPY package.json .
COPY package-lock.json .
RUN npm install .

COPY tools/wait-for .
COPY tools/run-production.sh .
COPY config config
COPY public public
COPY src src

RUN ["chmod", "+x", "wait-for"]
RUN ["chmod", "+x", "run-production.sh"]

EXPOSE 3030
ENTRYPOINT ["./run-production.sh"]
