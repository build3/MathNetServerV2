# mathnet

>

## About

This project uses [Feathers](http://feathersjs.com). An open source web
framework for building modern real-time applications.

## Getting Started

1. Make sure you have [NodeJS](https://nodejs.org/) and
   [npm](https://www.npmjs.com/) installed.
2. Install your dependencies

    ```
    cd path/to/mathnet; npm install
    ```

3. Instal mongo db.
The easiest way to set up mongodb is to set up docker image with mongo.
First of all install docker.
Then run:
```
docker pull mongo
docker run -d -p 27017:27017 --name mongo mongo
# to start/stop docker container perform
docker start mongo
docker stop mongo
```

4. Start your app

    ```
    npm start
    ```

## Testing

First install mocha globally with command `npm install -g mocha`. Then run
`make --always-make test`

## Scaffolding

Feathers has a powerful command line interface. Here are a few things it can do:

```
$ npm install -g @feathersjs/cli          # Install Feathers CLI

$ feathers generate service               # Generate a new Service
$ feathers generate hook                  # Generate a new Hook
$ feathers help                           # Show all commands
```

## Help

For more information on all the things you can do with Feathers visit
[docs.feathersjs.com](http://docs.feathersjs.com).
