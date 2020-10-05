# Work-Order-Backend

This is a repository for the backend API of my Peer-To-Peer work order platform.

The project is a peer-to-peer outsourcing program which matches general users with qualified tradesmen to complete real-world jobs.

Users will be able to post jobs that they are looking to have completed.
Tradesmen will be able to bid on jobs they want to complete.

The tech stack will be split into two:

1. The front-end:

-   react
-   redux

2. The back-end API (THIS REPO) use:

-   node
-   express
-   postgres

## Installation and Usage

Fork this repository, clone or download the ZIP.

```
npm run seed # sets up PSQL database work-order & work-order-test creates the relevant tables and seeds the work-order DB

npm run start # start server on localhost 3001
```

Additional scripts:

```
npm run test # runs jest tests with runInBand
npm run test_coverage # runs jest tests with coverage report
npm run debug # starts server in debug mode
```

A Insomnia file **Insomnia_project_file.json** has been included for users ease to review the routes.

## Users

There will be two types of users for this application:

1. General users

-   These users will have a job which they need help to complete (can be anything the users needs assistance with e.g. carpentry, landscaping, plumbing etc.)
-   Users will be able post a job and have an market place bid (timed) to complete the project - project address is kept secret until tradesmen has been selected
-   Once the market has been closed users will be sent a list of candidates for their project, including price to complete, past jobs, past ratings etc
-   Users will be able to select the tradesmen to proceed with.
-   Onced matched the tradesmen will be sent a link with the work address in addition through a web-socket a work-order instant chat will be set up to allow for instant communication
-   When the project is complete the user will rate the work and upload photos of the completed project(photos can also be uploaded by the tradesmen)

2. Tradesmen

-   These users will be able to login and bid for potential projects
-   When selected they will be sent a work order and instant chat (see above)

## Data

As this project will be completed as a peer to peer work-order there will be no third party database to connect to however the project will be seeded with General Users and Tradesmen

## Sensitive info

As many users will have work completed at their address both their names and addresses are considered sensitive information.

When tradesman bid on a project they will only be able to see the city, ZIP and country (they will not see the exact address). The project address will only be provided to the winner of the marketplace bid so they can complete the project.

## Sensitive info which will not be implemented - included as a Q&A

1. user ID verification - avoid duplicate users
2. tradesmen ID verification - avoid badly rated tradesmen creating a new identification to start again
3. fake project completion - avoid tradesmen creating users and acting as if they have completed projects

## License

[MIT](https://choosealicense.com/licenses/mit/)
