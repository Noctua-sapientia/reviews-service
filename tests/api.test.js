const app = require('../app');
const request = require("supertest");
const BookReview = require('../models/bookReview');
const SellerReview = require('../models/sellerReview');

describe("Reviews API", () => {
    describe("GET /", () => {
        it("Should return an HTML document", () => {
            return request(app).get("/").then((response) => {
                expect(response.status).toBe(200);
                expect(response.type).toEqual(expect.stringContaining("html"));
                expect(response.text).toEqual(expect.stringContaining("h1"));
            });
        })
    });

    describe("GET /reviews/books", () => {
        it("Should return all book reviews", () => {

            const bookReviews = [
                new BookReview({"bookId": 1, "customerId": 1, "description": "Muy chulo", "rating": 5}),
                new BookReview({"bookId": 2, "customerId": 1, "description": "Muy malo", "rating": 1})
            ];

            const mockFindChain = {
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockImplementation(() => Promise.resolve(bookReviews)),
            };

            dbFind = jest.spyOn(BookReview, 'find').mockImplementation(() => mockFindChain);

            return request(app).get("/api/v1/reviews/books").then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(2);
                expect(dbFind).toBeCalled();
            });
        })
    });

    describe("GET /reviews/sellers", () => {
        it("Should return all seller reviews", () => {
            
            const sellerReviews = [
                new SellerReview({"sellerId": 1, "customerId": 1, "description": "Muy rápido", "rating": 5}),
                new SellerReview({"sellerId": 2, "customerId": 1, "description": "Muy lento", "rating": 1})
            ];

            const mockFindChain = {
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockImplementation(() => Promise.resolve(sellerReviews)),
            };

            dbFind = jest.spyOn(SellerReview, 'find').mockImplementation(() => mockFindChain);

            return request(app).get("/api/v1/reviews/sellers").then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body).toBeArrayOfSize(2);
                expect(dbFind).toBeCalled();
            });
        })
    });

    describe("POST /reviews/books", () => {
        const bookReview = new BookReview({"bookId": 1, "customerId": 1, "description": "Muy chulo", "rating": 5});
        var dbSave;
        var dbExists;

        beforeEach(() => {
            dbSave = jest.spyOn(BookReview.prototype, "save");
            dbExists = jest.spyOn(BookReview, "exists");
        })

        it("Should add a new book review if everything is fine", () => {
            dbExists.mockImplementation(async () => Promise.resolve(false));
            dbSave.mockImplementation(async () => Promise.resolve(true));

            return request(app).post("/api/v1/reviews/books").send(bookReview).then((response) => {
                expect(response.statusCode).toBe(201);
                expect(dbSave).toBeCalled();
            });
        })

        it("Should return 500 if there is a problem with the connection", () => {
            dbSave.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).post("/api/v1/reviews/books").send(bookReview).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbSave).toBeCalled();
            });
        });
    });


    describe("POST /reviews/sellers", () => {
        const sellerReview = new BookReview({"sellerId": 1, "customerId": 1, "description": "Muy chulo", "rating": 5});
        var dbSave;
        var dbExists;

        beforeEach(() => {
            dbSave = jest.spyOn(SellerReview.prototype, "save");
            dbExists = jest.spyOn(SellerReview, "exists");
        })

        it("Should add a new seller review if everything is fine", () => {
            dbExists.mockImplementation(async () => Promise.resolve(false));
            dbSave.mockImplementation(async () => Promise.resolve(true));

            return request(app).post("/api/v1/reviews/sellers").send(sellerReview).then((response) => {
                expect(response.statusCode).toBe(201);
                expect(dbSave).toBeCalled();
            });
        })

        it("Should return 500 if there is a problem with the connection", () => {
            dbSave.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).post("/api/v1/reviews/sellers").send(sellerReview).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbSave).toBeCalled();
            });
        });
    });

    
    describe("PUT /reviews/books/:id", () => {
        const bookReview = new BookReview({"bookId": 1, "customerId": 1, "description": "Muy chulo", "rating": 5});
        var dbFindByIdAndUpdate;

        beforeEach(() => {
            dbFindByIdAndUpdate = jest.spyOn(BookReview, "findByIdAndUpdate");
        })

        it("Should update a book review if everything is fine", () => {
            dbFindByIdAndUpdate.mockImplementation(async () => Promise.resolve(bookReview));

            return request(app).put("/api/v1/reviews/books/1").send(bookReview).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(dbFindByIdAndUpdate).toBeCalled();
            });
        })

        it("Should return 500 if there is a problem with the connection", () => {
            dbFindByIdAndUpdate.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).put("/api/v1/reviews/books/1").send(bookReview).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbFindByIdAndUpdate).toBeCalled();
            });
        });
    });

    describe("PUT /reviews/sellers/:id", () => {
        const sellerReview = new SellerReview({"bookId": 1, "customerId": 1, "description": "Muy chulo", "rating": 5});
        var dbFindByIdAndUpdate;

        beforeEach(() => {
            dbFindByIdAndUpdate = jest.spyOn(SellerReview, "findByIdAndUpdate");
        })

        it("Should update a book review if everything is fine", () => {
            dbFindByIdAndUpdate.mockImplementation(async () => Promise.resolve(sellerReview));

            return request(app).put("/api/v1/reviews/sellers/1").send(sellerReview).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(dbFindByIdAndUpdate).toBeCalled();
            });
        })

        it("Should return 500 if there is a problem with the connection", () => {
            dbFindByIdAndUpdate.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).put("/api/v1/reviews/sellers/1").send(sellerReview).then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbFindByIdAndUpdate).toBeCalled();
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

            return request(app).delete("/api/v1/reviews/books/1").send().then((response) => {
                expect(response.statusCode).toBe(200);
                expect(dbDeleteOne).toBeCalled();
            });
        })

        it("Should return 500 if there is a problem with the connection", () => {
            dbDeleteOne.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).delete("/api/v1/reviews/books/1").send().then((response) => {
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

            return request(app).delete("/api/v1/reviews/sellers/1").send().then((response) => {
                expect(response.statusCode).toBe(200);
                expect(dbDeleteOne).toBeCalled();
            });
        })

        it("Should return 500 if there is a problem with the connection", () => {
            dbDeleteOne.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).delete("/api/v1/reviews/sellers/1").send().then((response) => {
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

            return request(app).delete("/api/v1/reviews/books?bookId=1").send().then((response) => {
                expect(response.statusCode).toBe(200);
                expect(dbDeleteMany).toBeCalled();
            });
        })

        it("Should return 500 if there is a problem with the connection", () => {
            dbDeleteMany.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).delete("/api/v1/reviews/books?bookId=1").send().then((response) => {
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

            return request(app).delete("/api/v1/reviews/sellers?sellerId=1").send().then((response) => {
                expect(response.statusCode).toBe(200);
                expect(dbDeleteMany).toBeCalled();
            });
        })

        it("Should return 500 if there is a problem with the connection", () => {
            dbDeleteMany.mockImplementation(async () => Promise.reject("Connection failed"));

            return request(app).delete("/api/v1/reviews/sellers?sellerId=1").send().then((response) => {
                expect(response.statusCode).toBe(500);
                expect(dbDeleteMany).toBeCalled();
            });
        });
    });


});