// Imports the server.js file to be tested.
let server = require("../server");
//Assertion (Test Driven Development) and Should, Expect(Behaviour driven development) library
let chai = require("chai");
// Chai HTTP provides an interface for live integration testing of the API's.
let chaiHttp = require("chai-http");
const { response } = require("express");
chai.should();
chai.use(chaiHttp); 
const { expect } = chai;
var assert = chai.assert;


describe("Server!", () => {

    //TEST 1
    it("Should render main page successfully", done => {
      chai
        .request(server)
        .get("/") //this is the testcase for the generic endpoint 
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equals("success");
          assert.strictEqual(res.body.message, "Welcome!");
          done();
        });
    });

    // Please add your test cases here.
    
    //TEST 2
   it("Returns all the reviews", done=>{
     chai
        .request(server)
        .get('/reviews')
        .end((err,res)=>{
          expect(res).to.have.status(200);
          done(); 
        });
   });


   


  });
