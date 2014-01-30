pasteye
=======

Pastebin Monitoring as a Service

## Why?

Well, why not? It's an interesting side project, and can be rather useful to some people. Great for breach notifications (i.e: realtime notification if a large DB has been pasted to Pastebin), and future versions will have custom filter features which would allow you to monitor for anything (i.e: Your own e-mail, to see if you have been compromised). 

Another aspect of this is the fact that there is no data as to *who* uses pastebin, and how. It would be interesting to analyze the data that surrounds pastebin usage and tangential fields.

## Installation

(Requires [Grunt](http://gruntjs.com/))

1. `git clone` the repo

2. `npm install .`

3. Configure `config.js` and `.env` appropriately

4. `grunt server` to start the server in the development environment

5. `grunt build` for a production build (will end up in the dist folder)

6. `grunt server:dist` to run server in production environment (will automatically re-build and serve from dist)

7. `grunt test` to run tests

## API Key Logic

On User create, API key is generated.

Key has following properties:

+ Is unique to user

+ Is seemingly 'random' to user

+ Cannot be regenerated or 'guessed' easily

+ Is therefore implied to be 'secure'

Although there is no collision check per se, the current chance of collision is: 4.4224999038811237107994661897277682453123397014×10^90 : 1.

For every request, API key is passed first. API key ties API actions to user.

## API Request Structure & Access

GET /api/users {apikey: (apikey)}--> Returns all Users (ADMIN)

GET /api/users/:id {apikey: (apikey)}--> Returns User with specified ID (ADMIN)

GET /api/users/:id/settings {apikey: (apikey)}--> Returns User Settings with specified ID (ADMIN)

POST /api/users {username: (username), password: (password), userEmail: (userEmail)} --> Creates User with no settings (ALL)

POST /api/users {username: (username), password: (password), userEmail: (userEmail), ip: (IP restriction), email: (email restriction), hash: (hash restriction)} --> Creates User with settings ip, email, and hash (ALL)

POST /api/users {apikey: (apikey), users: [{username: (username1), password: (password1), userEmail: (userEmail1), ip: (IP restriction1), email: (email restriction1), hash: (hash restriction1)}, {username: (username2)... hash: (hash restriction2)}, ...]} --> Creates users 1-* with allocated settings (ADMIN)

POST /api/users {apikey: (apikey), users: [{username: (username1), password: (password1), userEmail: (userEmail1)}, {username: (username2)... userEmail: (userEmail2)}, ...]} --> Creates users 1-* with no settings (ADMIN)

PUT /api/users/:id {apikey: (apikey), password: (password), userEmail: (userEmail), ip: (IP restriction), email: (email restriction), hash: (hash restriction)} --> Updates a User (via ID) with the given settings (USER)(ADMIN)

DELETE /api/users {apikey: (apikey), username: (username)} --> Deletes a user (USER)(ADMIN)

DELETE /api/users {apikey: (apikey), id: (id)} --> Deletes a user via ID (USER)(ADMIN)

DELETE /api/users {apikey: (apikey), users: [{username: (username)}, {username: (username2)}]} --> Deletes a set of users via username (ADMIN)

DELETE /api/users {apikey: (apikey), users: [{id: (id)}, {id: (id2)}]} --> Deletes a set of users via ID (ADMIN)

## TO DO BEFORE RELEASE

+ Clean up repo

+ Fix tests

+ Proper documentation

+ ~~License~~

## LICENSE

The MIT License (MIT)

Copyright (c) 2014 Shayan Mohanty

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

