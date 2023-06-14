'use strict;'

const request = require('supertest');
const server = require('./app');

describe('Server', () => {
//   let app;

//   beforeAll(() => {
//     // app = server.listen(3000, done); // Assuming your server is already initialized
//     // app = server;
//   });

    // afterAll(async () => {
    //     server.myApp.close();
    //     // app.close();
    // });

    // let app;

    // beforeEach(async () => {
    //     app = server.listen();
    // });
    
    // afterEach(async () => {
    //     server.close();
    // });

    // test('responds with JSON containing a message', async () => {
    //     await request(server).get('/chat/18')
    //         .expect(200)
    //         .then((response) => {
    //             expect(response.statusCode).toBe(200);
    //             expect(response.body).toBeInstanceOf(Object);
    //         });
    // });
  

    describe('GET /chat/18', () => {
        // test('It should get all the chats for a ChatId', async () => {
        //   return request(server).get('/chat/18')
        //   .then((response) => {
        //     expect(response.statusCode).toBe(200);
        //     expect(response.body).toBeInstanceOf(Object);
        //   });
          
        // //   expect(response.length).toBe(6); // Assuming two users in the response
        //     // return response;
        // });

        test('Testing to see if Jest works', () => {
            expect(1).toBe(1)
          })

        test('responds with JSON containing a message', async () => {
            const response = await request(server).get('/chat/18');
            expect(response.statusCode).toBe(200);
            expect(response.body).toBeInstanceOf(Object);
            expect(response.body.length).toBe(15); // Should be equal to Number of Messages
        });
    });

//   describe('POST /api/users', () => {
//     it('should create a new user', async () => {
//       const newUser = {
//         name: 'John Doe',
//         email: 'john@example.com',
//       };

//       const response = await request(app)
//         .post('/api/users')
//         .send(newUser);

//       expect(response.statusCode).toBe(201);
//       expect(response.body.name).toBe(newUser.name);
//       expect(response.body.email).toBe(newUser.email);
//     });
//   });
});
