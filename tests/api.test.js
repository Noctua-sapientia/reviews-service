const app = require('../app');
const request = require("supertest");
const jwt = require('jsonwebtoken');
const BookReview = require('../models/bookReview');
const SellerReview = require('../models/sellerReview');
const Book = require('../services/books');
const Order = require('../services/orders');
const User = require('../services/users');
const Comment = require("../services/checkComment");
const Email = require('../services/emailService');

describe("Reviews API", () => {

    let bookReviews;
    let bookReview;
    let bookReviewJSON;

    let sellerReviews;
    let sellerReview;
    let sellerReviewJSON;

    let numReviews;

    let jwtToken;

    beforeAll(() => {
        bookReviews = [
            new BookReview({"bookId": 1, "customerId": 1, "description": "Muy chulo", "rating": 5}),
            new BookReview({"bookId": 2, "customerId": 1, "description": "Muy malo", "rating": 1})
        ];
        bookReview = bookReviews[0];
        bookReviewJSON = {"bookId": 1, "customerId": 1, "description": "Muy chulo", "rating": 5};

        sellerReviews = [
            new SellerReview({"sellerId": 1, "customerId": 1, "description": "Muy rápido", "rating": 5}),
            new SellerReview({"sellerId": 2, "customerId": 1, "description": "Muy lento", "rating": 1})
        ];
        sellerReview = sellerReviews[0];
        sellerReviewJSON = {"sellerId": 1, "customerId": 1, "description": "Muy rápido", "rating": 5};
        
        numReviews = 3;

        const SECRET_KEY = 'a56d1f7c0c817387a072692731ea60df7c3a6c19d82ddac228a9a4461f8c5a72';

        jwtToken = jwt.sign({}, SECRET_KEY,);
    });

    describe("GET /", () => {
        it("Should return an HTML document", () => {
            return request(app).get("/").then((response) => {
                expect(response.status).toBe(200);
                expect(response.type).toEqual(expect.stringContaining("html"));
                expect(response.text).toEqual(expect.stringContaining("h1"));
            });
        });
    });

    describe("GET /reviews/books", () => {
        it("Should return all book reviews", () => {
            const mockFindChain = {
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockImplementation(() => Promise.resolve(bookReviews)),
            };
            dbFind = jest.spyOn(BookReview, 'find').mockImplementation(() => mockFindChain);
            return request(app).get("/api/v1/reviews/books").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(bookReviews.length);
                expect(response.body[0].id).toBe(bookReviews[0].id);
                expect(response.body[0].customerId).toBe(bookReviews[0].customerId);
                expect(response.body[0].description).toBe(bookReviews[0].description);
                expect(response.body[0].rating).toBe(bookReviews[0].rating);
                expect(response.body[0].bookId).toBe(bookReviews[0].bookId);
                expect(dbFind).toBeCalled();
            });
        });

        it("Should return the reviews of a certain book", () => {
            const mockFindChain = {
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockImplementation(() => Promise.resolve([bookReview])),
            };
            dbFind = jest.spyOn(BookReview, 'find').mockImplementation(() => mockFindChain);
            return request(app).get("/api/v1/reviews/books?bookId=1").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(1);
                expect(response.body[0].id).toBe(bookReview.id);
                expect(response.body[0].customerId).toBe(bookReview.customerId);
                expect(response.body[0].description).toBe(bookReview.description);
                expect(response.body[0].rating).toBe(bookReview.rating);
                expect(response.body[0].bookId).toBe(bookReview.bookId);
                expect(dbFind).toBeCalled();
            });
        });

        it("Should return 404 if certain book has no reviews", () => {
            const mockFindChain = {
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockImplementation(() => Promise.resolve([])),
            };
            dbFind = jest.spyOn(BookReview, 'find').mockImplementation(() => mockFindChain);
            return request(app).get("/api/v1/reviews/books?bookId=1").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(404);
                expect(dbFind).toBeCalled();
            });
        });

        it("Should return 404 if a customer has not done any book review", () => {
            const mockFindChain = {
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockImplementation(() => Promise.resolve([])),
            };
            dbFind = jest.spyOn(BookReview, 'find').mockImplementation(() => mockFindChain);
            return request(app).get("/api/v1/reviews/books?customerId=1").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(404);
                expect(dbFind).toBeCalled();
            });
        });

        it("Should return 400 if sort value is not rating or date", () => {
            return request(app).get("/api/v1/reviews/books?sort=name").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(400);
            });
        });

        it("Should return 400 if order value is not asc or desc", () => {
            return request(app).get("/api/v1/reviews/books?order=random").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(400);
            });
        });

        it("Should return 400 if limit value is not greater than 0", () => {
            return request(app).get("/api/v1/reviews/books?limit=0").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(400);
            });
        });

        it("Should return 400 if offset value is negative", () => {
            return request(app).get("/api/v1/reviews/books?offset=-1").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(400);
            });
        });
        
        it("Should return some book reviews with certain order...", () => {
            const mockFindChain = {
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockImplementation(() => Promise.resolve(bookReviews)),
            };
            dbFind = jest.spyOn(BookReview, 'find').mockImplementation(() => mockFindChain);
            return request(app).get("/api/v1/reviews/books?bookId=1&limit=2&offset=3&sort=date&order=desc").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(bookReviews.length);
                expect(response.body[0].id).toBe(bookReviews[0].id);
                expect(response.body[0].customerId).toBe(bookReviews[0].customerId);
                expect(response.body[0].description).toBe(bookReviews[0].description);
                expect(response.body[0].rating).toBe(bookReviews[0].rating);
                expect(response.body[0].bookId).toBe(bookReviews[0].bookId);
                expect(dbFind).toBeCalled();
            });
        });

    });

    describe("GET /reviews/sellers", () => {
        it("Should return all seller reviews", () => {

            const mockFindChain = {
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockImplementation(() => Promise.resolve(sellerReviews)),
            };

            dbFind = jest.spyOn(SellerReview, 'find').mockImplementation(() => mockFindChain);

            return request(app).get("/api/v1/reviews/sellers").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(sellerReviews.length);
                expect(response.body[0].id).toBe(sellerReviews[0].id);
                expect(response.body[0].customerId).toBe(sellerReviews[0].customerId);
                expect(response.body[0].description).toBe(sellerReviews[0].description);
                expect(response.body[0].rating).toBe(sellerReviews[0].rating);
                expect(response.body[0].sellerId).toBe(sellerReviews[0].sellerId);
                expect(dbFind).toBeCalled();
            });
        });

        it("Should return the reviews of a certain seller", () => {
            const mockFindChain = {
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockImplementation(() => Promise.resolve([sellerReview])),
            };
            dbFind = jest.spyOn(SellerReview, 'find').mockImplementation(() => mockFindChain);
            return request(app).get("/api/v1/reviews/sellers?sellerId=1").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(1);
                expect(response.body[0].id).toBe(sellerReview.id);
                expect(response.body[0].customerId).toBe(sellerReview.customerId);
                expect(response.body[0].description).toBe(sellerReview.description);
                expect(response.body[0].rating).toBe(sellerReview.rating);
                expect(response.body[0].sellerId).toBe(sellerReview.sellerId);
                expect(dbFind).toBeCalled();
            });
        });

        it("Should return 404 if certain seller has no reviews", () => {
            const mockFindChain = {
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockImplementation(() => Promise.resolve([])),
            };
            dbFind = jest.spyOn(SellerReview, 'find').mockImplementation(() => mockFindChain);
            return request(app).get("/api/v1/reviews/sellers?sellerId=1").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(404);
                expect(dbFind).toBeCalled();
            });
        });

        it("Should return 404 if a customer has not done any seller review", () => {
            const mockFindChain = {
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockImplementation(() => Promise.resolve([])),
            };
            dbFind = jest.spyOn(SellerReview, 'find').mockImplementation(() => mockFindChain);
            return request(app).get("/api/v1/reviews/sellers?customerId=1").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(404);
                expect(dbFind).toBeCalled();
            });
        });

        it("Should return 400 if sort value is not rating or date", () => {
            return request(app).get("/api/v1/reviews/sellers?sort=name").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(400);
            });
        });

        it("Should return 400 if order value is not asc or desc", () => {
            return request(app).get("/api/v1/reviews/sellers?order=random").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(400);
            });
        });

        it("Should return 400 if limit value is not greater than 0", () => {
            return request(app).get("/api/v1/reviews/sellers?limit=0").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(400);
            });
        });

        it("Should return 400 if offset value is negative", () => {
            return request(app).get("/api/v1/reviews/sellers?offset=-1").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(400);
            });
        });
        
        it("Should return some book reviews with certain order...", () => {
            const mockFindChain = {
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockImplementation(() => Promise.resolve(sellerReviews)),
            };
            dbFind = jest.spyOn(SellerReview, 'find').mockImplementation(() => mockFindChain);
            return request(app).get("/api/v1/reviews/sellers?sellerId=1&limit=2&offset=3&sort=date&order=desc").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(sellerReviews.length);
                expect(response.body[0].id).toBe(sellerReviews[0].id);
                expect(response.body[0].customerId).toBe(sellerReviews[0].customerId);
                expect(response.body[0].description).toBe(sellerReviews[0].description);
                expect(response.body[0].rating).toBe(sellerReviews[0].rating);
                expect(response.body[0].sellerId).toBe(sellerReviews[0].sellerId);
                expect(dbFind).toBeCalled();
            });
        });
    });

    describe("GET /reviews/books/count", () => {
        it("Should return the number of book reviews", () => {

            dbCount = jest.spyOn(BookReview, 'countDocuments');
            dbCount.mockImplementation(() => Promise.resolve(numReviews));

            return request(app).get("/api/v1/reviews/books/count").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body.count).toBe(numReviews);
                expect(dbCount).toBeCalled();
            });
        })

        it("Should return 500 if there is a problem with the connection", () => {
            dbCount.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).get("/api/v1/reviews/books/count").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbCount).toBeCalled();
            });
        });
    });

    describe("GET /reviews/sellers/count", () => {
        it("Should return the number of sellers reviews", () => {

            dbCount = jest.spyOn(SellerReview, 'countDocuments');
            dbCount.mockImplementation(() => Promise.resolve(numReviews));

            return request(app).get("/api/v1/reviews/sellers/count").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body.count).toBe(numReviews);
                expect(dbCount).toBeCalled();
            });
        })

        it("Should return 500 if there is a problem with the connection", () => {
            dbCount.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).get("/api/v1/reviews/books/count").set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbCount).toBeCalled();
            });
        });
    });

    describe("POST /reviews/books", () => {
        var dbSave;
        var dbExists;

        beforeEach(() => {
            dbSave = jest.spyOn(BookReview.prototype, "save");
            dbExists = jest.spyOn(BookReview, "exists");
            existsBook = jest.spyOn(Book, "existsBook");
            dbAggregate = jest.spyOn(BookReview, "aggregate");
            updateRatingBook = jest.spyOn(Book, "updateRatingBook");
            containsInsult = jest.spyOn(Comment, "checkComment");
            infoCustomer = jest.spyOn(User, "getCustomerInfo");
            titleBook = jest.spyOn(Book, "getBookTitle");
            sendEmail = jest.spyOn(Email, "sendEmail");
        });

        it("Should add a new book review if everything is fine", () => {
            dbExists.mockImplementation(async () => Promise.resolve(false));
            dbSave.mockImplementation(async () => Promise.resolve(true));
            existsBook.mockImplementation(async () => Promise.resolve(true));
            dbAggregate.mockImplementation(async () => Promise.resolve([{ _id: null, averageRating: 4.2 }]));
            updateRatingBook.mockImplementation(async () => Promise.resolve(true));
            containsInsult.mockImplementation(async () => Promise.resolve("False"));

            return request(app).post("/api/v1/reviews/books").send(bookReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(201);
                expect(dbExists).toBeCalled();
                expect(dbSave).toBeCalled();
                expect(existsBook).toBeCalled();
                expect(dbAggregate).toBeCalled();
                expect(updateRatingBook).toBeCalled();
                expect(response.body.customerId).toBe(bookReviewJSON.customerId);
                expect(response.body.description).toBe(bookReviewJSON.description);
                expect(response.body.rating).toBe(bookReviewJSON.rating);
                expect(response.body.bookId).toBe(bookReviewJSON.bookId);
            });
        });

        it("Should return 403 if the comment contains an insutl", () => {
            dbExists.mockImplementation(async () => Promise.resolve(false));
            existsBook.mockImplementation(async () => Promise.resolve(true));
            containsInsult.mockImplementation(async () => Promise.resolve("True"));
            infoCustomer.mockImplementation(async () => Promise.resolve(true));
            titleBook.mockImplementation(async () => Promise.resolve(true));
            sendEmail.mockImplementation(async () => Promise.resolve(true));


            return request(app).post("/api/v1/reviews/books").send(bookReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(403);
                expect(dbExists).toBeCalled();
                expect(existsBook).toBeCalled();
                expect(containsInsult).toBeCalled();
                expect(infoCustomer).toBeCalled();
                expect(titleBook).toBeCalled();
                expect(sendEmail).toBeCalled();
            });
        });

        it("Should return 400 if a book does not exist", () => {
            existsBook.mockImplementation(async () => Promise.resolve(false));

            return request(app).post("/api/v1/reviews/books").send(bookReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(400);
                expect(existsBook).toBeCalled();
            });
        });

        it("Should return 502 if there is a problem with book service when checking if book exists", () => {
            existsBook.mockImplementation(async () => Promise.resolve(null));

            return request(app).post("/api/v1/reviews/books").send(bookReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(502);
                expect(existsBook).toBeCalled();
            });
        });

        it("Should return 400 if the rating is greater than 5", () => {
            existsBook.mockImplementation(async () => Promise.resolve(true));

            let bookReviewJSONRatePos = {"bookId": 1, "customerId": 1, "description": "Muy chulo", "rating": 7};

            return request(app).post("/api/v1/reviews/books").send(bookReviewJSONRatePos).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(400);
                expect(existsBook).toBeCalled();
            });
        });

        it("Should return 400 if the rating is lower than 1", () => {
            existsBook.mockImplementation(async () => Promise.resolve(true));

            let bookReviewJSONRateNeg = {"bookId": 1, "customerId": 1, "description": "Muy chulo", "rating": 0};

            return request(app).post("/api/v1/reviews/books").send(bookReviewJSONRateNeg).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(400);
                expect(existsBook).toBeCalled();
            });
        });

        it("Should return 409 if there is already a review from the customer to the book", () => {
            existsBook.mockImplementation(async () => Promise.resolve(true));
            dbExists.mockImplementation(async () => Promise.resolve(true));

            return request(app).post("/api/v1/reviews/books").send(bookReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(409);
                expect(existsBook).toBeCalled();
                expect(dbExists).toBeCalled();
            });
        });

        it("Should return 500 if there is a problem with the connection", () => {
            existsBook.mockImplementation(async () => Promise.resolve(true));
            dbExists.mockImplementation(async () => Promise.resolve(false));
            dbSave.mockImplementation(async () => Promise.reject("Connection failed"));
            containsInsult.mockImplementation(async () => Promise.resolve("False"));

            return request(app).post("/api/v1/reviews/books").send(bookReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbSave).toBeCalled();
                expect(existsBook).toBeCalled();
                expect(dbExists).toBeCalled();
            });
        });
    });


    describe("POST /reviews/sellers", () => {
        var dbSave;
        var dbExists;

        beforeEach(() => {
            dbSave = jest.spyOn(SellerReview.prototype, "save");
            dbExists = jest.spyOn(SellerReview, "exists");
            existsOrderBetweenCustomerSeller = jest.spyOn(Order, "existsOrder");
            dbAggregate = jest.spyOn(SellerReview, "aggregate");
            updateRatingSeller = jest.spyOn(User, "updateRatingSeller");
            containsInsult = jest.spyOn(Comment, "checkComment");
            infoCustomer = jest.spyOn(User, "getCustomerInfo");
            infoSeller = jest.spyOn(User, "getSellerInfo");
            sendEmail = jest.spyOn(Email, "sendEmail");
        })

        it("Should add a new seller review if everything is fine", () => {
            dbExists.mockImplementation(async () => Promise.resolve(false));
            dbSave.mockImplementation(async () => Promise.resolve(true));
            existsOrderBetweenCustomerSeller.mockImplementation(async () => Promise.resolve(true));
            dbAggregate.mockImplementation(async () => Promise.resolve([{ _id: null, averageRating: 4.2 }]));
            updateRatingSeller.mockImplementation(async () => Promise.resolve(true));
            containsInsult.mockImplementation(async () => Promise.resolve("False"));

            return request(app).post("/api/v1/reviews/sellers").send(sellerReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(201);
                expect(dbSave).toBeCalled();
                expect(existsOrderBetweenCustomerSeller).toBeCalled();
                expect(dbAggregate).toBeCalled();
                expect(updateRatingSeller).toBeCalled();
                expect(response.body.customerId).toBe(sellerReviewJSON.customerId);
                expect(response.body.description).toBe(sellerReviewJSON.description);
                expect(response.body.rating).toBe(sellerReviewJSON.rating);
                expect(response.body.sellerId).toBe(sellerReviewJSON.sellerId);
                expect(dbFind).toBeCalled();
                expect(containsInsult).toBeCalled();
            });
        });

        it("Should return 403 if the comment contains an insutl", () => {
            dbExists.mockImplementation(async () => Promise.resolve(false));
            existsBook.mockImplementation(async () => Promise.resolve(true));
            containsInsult.mockImplementation(async () => Promise.resolve("True"));
            infoCustomer.mockImplementation(async () => Promise.resolve(true));
            infoSeller.mockImplementation(async () => Promise.resolve(true));
            sendEmail.mockImplementation(async () => Promise.resolve(true));


            return request(app).post("/api/v1/reviews/sellers").send(bookReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(403);
                expect(dbExists).toBeCalled();
                expect(existsBook).toBeCalled();
                expect(containsInsult).toBeCalled();
                expect(infoCustomer).toBeCalled();
                expect(infoSeller).toBeCalled();
                expect(sendEmail).toBeCalled();
            });
        });

        it("Should return 400 if the customer has not make any order to the seller", () => {
            existsOrderBetweenCustomerSeller.mockImplementation(async () => Promise.resolve(false));

            return request(app).post("/api/v1/reviews/sellers").send(bookReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(400);
                expect(existsOrderBetweenCustomerSeller).toBeCalled();
            });
        });

        it("Should return 502 if there is a problem with user service when checking if an order exists", () => {
            existsOrderBetweenCustomerSeller.mockImplementation(async () => Promise.resolve(null));

            return request(app).post("/api/v1/reviews/sellers").send(sellerReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(502);
                expect(existsOrderBetweenCustomerSeller).toBeCalled();
            });
        });

        it("Should return 400 if the rating is greater than 5", () => {
            existsOrderBetweenCustomerSeller.mockImplementation(async () => Promise.resolve(true));

            let sellerReviewJSONRatePos = {"sellerId": 1, "customerId": 1, "description": "Muy chulo", "rating": 7};

            return request(app).post("/api/v1/reviews/sellers").send(sellerReviewJSONRatePos).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(400);
                expect(existsOrderBetweenCustomerSeller).toBeCalled();
            });
        });

        it("Should return 400 if the rating is lower than 1", () => {
            existsOrderBetweenCustomerSeller.mockImplementation(async () => Promise.resolve(true));

            let sellerReviewJSONRateNeg = {"sellerId": 1, "customerId": 1, "description": "Muy chulo", "rating": 0};

            return request(app).post("/api/v1/reviews/sellers").send(sellerReviewJSONRateNeg).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(400);
                expect(existsOrderBetweenCustomerSeller).toBeCalled();
            });
        });

        it("Should return 409 if there is already a review from the customer to the seller", () => {
            existsOrderBetweenCustomerSeller.mockImplementation(async () => Promise.resolve(true));
            dbExists.mockImplementation(async () => Promise.resolve(true));

            return request(app).post("/api/v1/reviews/sellers").send(bookReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(409);
                expect(existsOrderBetweenCustomerSeller).toBeCalled();
                expect(dbExists).toBeCalled();
            });
        });

        it("Should return 403 if the comment contains any insult", () => {
            existsOrderBetweenCustomerSeller.mockImplementation(async () => Promise.resolve(true));
            dbExists.mockImplementation(async () => Promise.resolve(false));
            containsInsult.mockImplementation(async () => Promise.resolve("True"));
            infoCustomer.mockImplementation(async () => Promise.resolve(true));
            infoSeller.mockImplementation(async () => Promise.resolve(true));
            sendEmail.mockImplementation(async () => Promise.resolve(true));

            return request(app).post("/api/v1/reviews/sellers").send(bookReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(403);
                expect(existsOrderBetweenCustomerSeller).toBeCalled();
                expect(dbExists).toBeCalled();
                expect(containsInsult).toBeCalled();
                expect(infoCustomer).toBeCalled();
                expect(infoSeller).toBeCalled();
                expect(sendEmail).toBeCalled();
            }); 
        });

        it("Should return 502 if there is a problem with comment microservice", () => {
            existsOrderBetweenCustomerSeller.mockImplementation(async () => Promise.resolve(true));
            dbExists.mockImplementation(async () => Promise.resolve(true));
            containsInsult.mockImplementation(async () => Promise.resolve(null));

            return request(app).post("/api/v1/reviews/sellers").send(bookReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(409);
                expect(existsOrderBetweenCustomerSeller).toBeCalled();
                expect(dbExists).toBeCalled();
                expect(containsInsult).toBeCalled();
            });
        });

        it("Should return 500 if there is a problem with the connection", () => {
            existsOrderBetweenCustomerSeller.mockImplementation(async () => Promise.resolve(true));
            dbExists.mockImplementation(async () => Promise.resolve(false));
            dbSave.mockImplementation(async () => Promise.reject("Connection failed"));
            containsInsult.mockImplementation(async () => Promise.resolve(false));

            return request(app).post("/api/v1/reviews/sellers").send(sellerReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbSave).toBeCalled();
                expect(dbExists).toBeCalled();
                expect(existsOrderBetweenCustomerSeller).toBeCalled();
            });
        });
    });

    
    describe("PUT /reviews/books/:id", () => {
        var dbFindByIdAndUpdate;
        var dbExists;
        var dbAggregate;
        var updateRatingBook;

        beforeEach(() => {
            dbFindByIdAndUpdate = jest.spyOn(BookReview, "findByIdAndUpdate");
            dbExists = jest.spyOn(BookReview, "exists");
            dbAggregate = jest.spyOn(BookReview, "aggregate");
            updateRatingBook = jest.spyOn(Book, "updateRatingBook");

            
        })

        it("Should update a book review if everything is fine", () => {
            dbExists.mockImplementation(async () => Promise.resolve(true));
            dbFindByIdAndUpdate.mockImplementation(async () => Promise.resolve(bookReview));
            dbAggregate.mockImplementation(async () => Promise.resolve([{ _id: null, averageRating: 4.2 }]));
            updateRatingBook.mockImplementation(async () => Promise.resolve());
            containsInsult.mockImplementation(async () => Promise.resolve("False"));

            return request(app).put("/api/v1/reviews/books/1").send(bookReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(dbExists).toBeCalled();
                expect(dbFindByIdAndUpdate).toBeCalled();
                expect(dbAggregate).toBeCalled();
                expect(updateRatingBook).toBeCalled();
            });
        })

        it("Should return 500 if there is a problem with the connection v1", () => {
            dbExists.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).put("/api/v1/reviews/books/1").send(bookReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbExists).toBeCalled();
            });
        });

        it("Should return 500 if there is a problem with the connection v2", () => {
            dbFindByIdAndUpdate.mockImplementation(async () => Promise.reject("Connection failed"));
            dbExists.mockImplementation(async () => Promise.resolve(true));

            return request(app).put("/api/v1/reviews/books/1").send(bookReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbFindByIdAndUpdate).toBeCalled();
                expect(dbExists).toBeCalled();
            });
        });

        it("Should return 500 if there is a problem with the connection v3", () => {
            dbFindByIdAndUpdate.mockImplementation(async () => Promise.resolve(bookReview));
            dbExists.mockImplementation(async () => Promise.resolve(true));
            dbAggregate.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).put("/api/v1/reviews/books/1").send(bookReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbFindByIdAndUpdate).toBeCalled();
                expect(dbExists).toBeCalled();
                expect(dbAggregate).toBeCalled();
            });
        });

        it("Should return 500 if there is a problem with the connection to book service", () => {
            dbFindByIdAndUpdate.mockImplementation(async () => Promise.resolve(bookReview));
            dbExists.mockImplementation(async () => Promise.resolve(true));
            dbAggregate.mockImplementation(async () => Promise.resolve([{ _id: null, averageRating: 4.2 }]));
            updateRatingBook.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).put("/api/v1/reviews/books/1").send(bookReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbFindByIdAndUpdate).toBeCalled();
                expect(dbExists).toBeCalled();
                expect(dbAggregate).toBeCalled();
                expect(updateRatingBook).toBeCalled();
            });
        });
    });

    describe("PUT /reviews/sellers/:id", () => {
        var dbFindByIdAndUpdate;
        var dbExists;
        var dbAggregate;
        var updateRatingSeller;
        var containsInsult;
        var infoCustomer;
        var infoSeller;
        var sendEmail;

        beforeEach(() => {
            dbFindByIdAndUpdate = jest.spyOn(SellerReview, "findByIdAndUpdate");
            dbExists = jest.spyOn(SellerReview, "exists");
            dbAggregate = jest.spyOn(SellerReview, "aggregate");
            updateRatingSeller = jest.spyOn(User, "updateRatingSeller");
            containsInsult = jest.spyOn(Comment, "checkComment");
            infoCustomer = jest.spyOn(User, "getCustomerInfo");
            infoSeller = jest.spyOn(User, "getSellerInfo");
            sendEmail = jest.spyOn(Email, "sendEmail");
        })

        it("Should update a seller review if everything is fine", () => {
            dbExists.mockImplementation(async () => Promise.resolve(true));
            containsInsult.mockImplementation(async () => Promise.resolve("False"));
            dbFindByIdAndUpdate.mockImplementation(async () => Promise.resolve(sellerReview));
            dbAggregate.mockImplementation(async () => Promise.resolve([{ _id: null, averageRating: 4.2 }]));
            updateRatingSeller.mockImplementation(async () => Promise.resolve(true));

            return request(app).put("/api/v1/reviews/sellers/1").send(sellerReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(dbExists).toBeCalled();
                expect(containsInsult).toBeCalled();
                expect(dbAggregate).toBeCalled();
                expect(updateRatingBook).toBeCalled();
            });
        })

        it("Should return 500 if there is a problem with the connection v1", () => {
            dbExists.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).put("/api/v1/reviews/sellers/1").send(sellerReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbExists).toBeCalled();
            });
        });

        it("Should return 500 if there is a problem with the connection v2", () => {
            dbExists.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).put("/api/v1/reviews/sellers/1").send(sellerReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbExists).toBeCalled(); 
            });
        });

        it("Should return 500 if there is a problem with the connection v3", () => {
            dbFindByIdAndUpdate.mockImplementation(async () => Promise.resolve(sellerReview));
            dbExists.mockImplementation(async () => Promise.resolve(true));
            dbAggregate.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).put("/api/v1/reviews/sellers/1").send(sellerReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbExists).toBeCalled();
                expect(dbAggregate).toBeCalled();
            });
        });

        it("Should return 500 if there is a problem with the connection to book service", () => {
            dbFindByIdAndUpdate.mockImplementation(async () => Promise.resolve(sellerReview));
            dbExists.mockImplementation(async () => Promise.resolve(true));
            dbAggregate.mockImplementation(async () => Promise.resolve([{ _id: null, averageRating: 4.2 }]));
            updateRatingSeller.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).put("/api/v1/reviews/sellers/1").send(sellerReviewJSON).set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbExists).toBeCalled();
                expect(dbAggregate).toBeCalled();
                expect(updateRatingSeller).toBeCalled();
            });
        });
    });

    describe("DELETE /reviews/books/:id", () => {
        var dbDeleteOne;

        beforeEach(() => {
            dbDeleteOne = jest.spyOn(BookReview, "deleteOne");
        })

        it("Should delete a book review if everything is fine", () => {
            dbDeleteOne.mockImplementation(async () => Promise.resolve(true));

            return request(app).delete("/api/v1/reviews/books/1").send().set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(dbDeleteOne).toBeCalled();
            });
        })

        it("Should return 500 if there is a problem with the connection", () => {
            dbDeleteOne.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).delete("/api/v1/reviews/books/1").send().set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbDeleteOne).toBeCalled();
            });
        });
    });

    describe("DELETE /reviews/sellers/:id", () => {
        var dbDeleteOne;

        beforeEach(() => {
            dbDeleteOne = jest.spyOn(SellerReview, "deleteOne");
        })

        it("Should delete a seller review if everything is fine", () => {
            dbDeleteOne.mockImplementation(async () => Promise.resolve(true));

            return request(app).delete("/api/v1/reviews/sellers/1").send().set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(dbDeleteOne).toBeCalled();
            });
        })

        it("Should return 500 if there is a problem with the connection", () => {
            dbDeleteOne.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).delete("/api/v1/reviews/sellers/1").send().set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbDeleteOne).toBeCalled();
            });
        });
    });

    describe("DELETE /reviews/books?bookId", () => {
        var dbDeleteMany;

        beforeEach(() => {
            dbDeleteMany = jest.spyOn(BookReview, "deleteMany");
        })

        it("Should delete all reviews from one book if everything is fine", () => {
            dbDeleteMany.mockImplementation(async () => Promise.resolve(true));

            return request(app).delete("/api/v1/reviews/books?bookId=1").send().set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(dbDeleteMany).toBeCalled();
            });
        })

        it("Should return 500 if there is a problem with the connection", () => {
            dbDeleteMany.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).delete("/api/v1/reviews/books?bookId=1").send().set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbDeleteMany).toBeCalled();
            });
        });
    });

    describe("DELETE /reviews/sellers?sellerId", () => {
        var dbDeleteMany;

        beforeEach(() => {
            dbDeleteMany = jest.spyOn(SellerReview, "deleteMany");
        })

        it("Should delete all reviews from one seller if everything is fine", () => {
            dbDeleteMany.mockImplementation(async () => Promise.resolve(true));

            return request(app).delete("/api/v1/reviews/sellers?sellerId=1").send().set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(dbDeleteMany).toBeCalled();
            });
        })

        it("Should return 500 if there is a problem with the connection", () => {
            dbDeleteMany.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).delete("/api/v1/reviews/sellers?sellerId=1").send().set('Authorization', jwtToken).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbDeleteMany).toBeCalled();
            });
        });
    });

});