## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation
```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start 

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
## For create migration

* **Create tables**    GET method 'http://localhost:3000/create-migration'
* **Drop tables**      GET method 'http://localhost:3000/drop-table'

## Routes
* **Rent Car**         GET method 'http://localhost:3000/car/${auto_id}/rent' with body {fromDate: Date, ToDate: Date}
* **Get Report**         POST method 'http://localhost:3000/report/${Date(year_month)}/rent'




