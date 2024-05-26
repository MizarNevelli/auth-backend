## Get started

### To run the project locally you need to set these env variables:

- DATABASE_URL, MAIL_HOST, MAIL_PASSWORD, MAIL_USERNAME, JWT_SECRET, COOKIE_SECRET, CLIENT_URL

### Then run these commands:

`npm i`<br>
`npm run dev`

### To make a migration on prisma use this command (here you can name your migration anything, in this case, init)

`npx prisma migrate dev --name init`
