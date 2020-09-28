# Work-order
Capstone Project 2 - peer-to-peer work order platform

## Goals
This application will be split into two parts a front-end for end users and a back-end to store the database.  

The project is a peer-to-peer outsourcing program which matches general users with qualified tradesmen to complete real-world jobs. 

Users will be able to post jobs that they are looking to have completed. 
Tradesmen will be able to bid on jobs they want to complete. 


## Tech Stack
The tech stack will be split into two: 
1. The front-end will use: 
  - react
  - redux
  
2. The back-end will use:
  - node
  - express 
  - postgres

## Users
There can be two types of users for this application:
1. General users 
  - These users will have a job which they need help to complete (can be anything the users needs assistance with e.g. carpentry, landscaping, plumbing etc.)
  - Users will be able post a job and have an market place bid (timed) to complete the project - project address is kept secret until tradesmen has been selected
  - Once the market has been closed users will be sent a list of candidates for their project, including price to complete, past jobs, past ratings etc
  - Users will be able to select the tradesmen to proceed with. 
  - Onced matched the tradesmen will be sent a link with the work address in addition through a web-socket a work-order instant chat will be set up to allow for instant communication
  - When the project is complete the user will rate the work and upload photos of the completed project(photos can also be uploaded by the tradesmen)
  
2. Tradesmen 
  - These users will be able to login and bid for potential projects
  - When selected they will be sent a work order and instant chat (see above)

## Data
As this project will be compeled as a peer to peer work-order there will be no third party database to connect to however the project will be seeded with General Users and Tradesmen

## Sensitive info
As many users will have work completed at their address both their names and addresses are considered sensitive information.  
The address will be encrypted and both the names and address will be only avaliable on secured urls.  

## Sensitive info which will not be implemented - included as a Q&A
1. user verification - avoid duplicate users
2. tradesmen verification - avoid badly rated tradesmen creating a new identification to start again
3. fake project completion - avoid tradesmen creating users and acting as if they have completed projects 

## Database Schema
- Users:
  - id
  - f_name
  - l_name
  - email
  - phone
  - address
  - password
  - photo - optional
    
- Tradesmen: 
  - id
  - name
  - address
  - phone
  - email
  - photo
  - rating
  - password

- Projects
  - project_id
  - user_id
  - description
  - address
  - created_at
  - price
  - tradesmen_id
  - status
  - completed_at
  - issues
  - chat_id
  - photos_id

- Photos
  - id
  - project_id
  - photo
  - after /// boolean (if true photo is an after photo if false photo is before)

- Chat
  - id
  - user_id
  - tradesmen_id
  - comment
  - timestamp

- Reviews
  - id
  - user_id
  - tradesmen_id
  - project_id
  - review_comment
  - review_rating
