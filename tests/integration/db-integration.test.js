const BookReview = require('../../models/bookReview');
const SellerReview = require('../../models/sellerReview');
const dbConnect = require('../../dbTests');

jest.setTimeout(30000);

describe('Reviews DB connection', () => {

    beforeAll((done) => {
        if(dbConnect.readyState === 1) {
            done();
        } else {
            dbConnect.on("connected", () => done());
        }
    });

    describe('Book Reviews DB connection', () => {
        beforeEach(async () => {
            await BookReview.deleteMany({});
        });
    
        it('Writes a book review in the DB', async () => {
            const bookReview = new BookReview({"bookId": 1, "customerId": 1, "description": "Muy chulo", "rating": 5})
            await bookReview.save();
            bookReviews = await BookReview.find();
            expect(bookReviews).toBeArrayOfSize(1);
        });

        it("Should get a book review by id correctly", async () => {
            const bookReview = new BookReview({"bookId": 1, "customerId": 1, "description": "Muy chulo", "rating": 5})
            const bookReviewDone = await bookReview.save();
            bookReviewFound = await BookReview.findById(bookReviewDone._id);
            expect(bookReviewFound.bookId).toBe(bookReview.bookId);
            expect(bookReviewFound.customerId).toBe(bookReview.customerId);
            expect(bookReviewFound.description).toBe(bookReview.description);
            expect(bookReviewFound.rating).toBe(bookReview.rating);
        });

        it("Should get book reviews by book id correctly", async () => {
            const bookReview1 = new BookReview({"bookId": 1, "customerId": 1, "description": "Muy chulo", "rating": 5})
            const bookReview2 = new BookReview({"bookId": 1, "customerId": 2, "description": "Muy malo", "rating": 1})
            const bookReviewDone1 = await bookReview1.save();
            const bookReviewDone2 = await bookReview2.save();
            bookReviewsFound = await BookReview.find({bookId: bookReviewDone1.bookId});
            expect(bookReviewsFound[0].bookId).toBe(bookReview1.bookId);
            expect(bookReviewsFound[0].customerId).toBe(bookReview1.customerId);
            expect(bookReviewsFound[0].description).toBe(bookReview1.description);
            expect(bookReviewsFound[0].rating).toBe(bookReview1.rating);
            expect(bookReviewsFound[1].bookId).toBe(bookReview2.bookId);
            expect(bookReviewsFound[1].customerId).toBe(bookReview2.customerId);
            expect(bookReviewsFound[1].description).toBe(bookReview2.description);
            expect(bookReviewsFound[1].rating).toBe(bookReview2.rating);
            expect(bookReviewsFound).toBeArrayOfSize(2);
        });

        it("Should get book reviews by customer id correctly", async () => {
            const bookReview1 = new BookReview({"bookId": 1, "customerId": 1, "description": "Muy chulo", "rating": 5})
            const bookReview2 = new BookReview({"bookId": 2, "customerId": 1, "description": "Muy malo", "rating": 1})
            const bookReviewDone1 = await bookReview1.save();
            const bookReviewDone2 = await bookReview2.save();
            bookReviewsFound = await BookReview.find({customerId: bookReviewDone1.customerId});
            expect(bookReviewsFound[0].bookId).toBe(bookReview1.bookId);
            expect(bookReviewsFound[0].customerId).toBe(bookReview1.customerId);
            expect(bookReviewsFound[0].description).toBe(bookReview1.description);
            expect(bookReviewsFound[0].rating).toBe(bookReview1.rating);
            expect(bookReviewsFound[1].bookId).toBe(bookReview2.bookId);
            expect(bookReviewsFound[1].customerId).toBe(bookReview2.customerId);
            expect(bookReviewsFound[1].description).toBe(bookReview2.description);
            expect(bookReviewsFound[1].rating).toBe(bookReview2.rating);
            expect(bookReviewsFound).toBeArrayOfSize(2);
        });

        it("Should get all book reviews correctly", async () => {
            const bookReview1 = new BookReview({"bookId": 1, "customerId": 1, "description": "Muy chulo", "rating": 5})
            const bookReview2 = new BookReview({"bookId": 2, "customerId": 2, "description": "Muy malo", "rating": 1})
            await bookReview1.save();
            await bookReview2.save();
            bookReviewsFound = await BookReview.find();         
            expect(bookReviewsFound[0].bookId).toBe(bookReview1.bookId);
            expect(bookReviewsFound[0].customerId).toBe(bookReview1.customerId);
            expect(bookReviewsFound[0].description).toBe(bookReview1.description);
            expect(bookReviewsFound[0].rating).toBe(bookReview1.rating);
            expect(bookReviewsFound[1].bookId).toBe(bookReview2.bookId);
            expect(bookReviewsFound[1].customerId).toBe(bookReview2.customerId);
            expect(bookReviewsFound[1].description).toBe(bookReview2.description);
            expect(bookReviewsFound[1].rating).toBe(bookReview2.rating);
            expect(bookReviewsFound).toBeArrayOfSize(2);
        });

        it("Should update a book review by id correctly", async () => {
            const bookReview = new BookReview({"bookId": 1, "customerId": 1, "description": "Muy chulo", "rating": 5})
            const bookReviewDone = await bookReview.save();
            await BookReview.findByIdAndUpdate(bookReviewDone._id, {"bookId": 2, "customerId": 2, "description": "Muy malo", "rating": 1})
            bookReviewFound = await BookReview.findById(bookReviewDone._id);
            expect(bookReviewFound.bookId).toBe(2);
            expect(bookReviewFound.customerId).toBe(2);
            expect(bookReviewFound.description).toBe("Muy malo");
            expect(bookReviewFound.rating).toBe(1);
        });

        it("Should delete a book review correctly", async () => {
            const bookReview = new BookReview({"bookId": 1, "customerId": 1, "description": "Muy chulo", "rating": 5})
            const bookReviewDone = await bookReview.save();
            await BookReview.findByIdAndDelete(bookReviewDone._id);
            const bookReviews = await BookReview.find();
            expect(bookReviews).toBeArrayOfSize(0);
        });
    });

    describe('Seller Reviews DB connection', () => {
        beforeEach(async () => {
            await SellerReview.deleteMany({});
        });
    
        it('Writes a seller review in the DB', async () => {
            const sellerReview = new SellerReview({"sellerId": 1, "customerId": 1, "description": "Muy buen trato", "rating": 5})
            await sellerReview.save();
            sellerReviews = await SellerReview.find();
            expect(sellerReviews).toBeArrayOfSize(1);
        });

        it("Should get a seller review by id correctly", async () => {
            const sellerReview = new SellerReview({"sellerId": 1, "customerId": 1, "description": "Muy buen trato", "rating": 5})
            const sellerReviewDone = await sellerReview.save();
            sellerReviewFound = await SellerReview.findById(sellerReviewDone._id);
            expect(sellerReviewFound.bookId).toBe(sellerReview.bookId);
            expect(sellerReviewFound.customerId).toBe(sellerReview.customerId);
            expect(sellerReviewFound.description).toBe(sellerReview.description);
            expect(sellerReviewFound.rating).toBe(sellerReview.rating);
        });

        it("Should get seller reviews by seller id correctly", async () => {
            const sellerReview1 = new SellerReview({"sellerId": 1, "customerId": 1, "description": "Muy buen trato", "rating": 5})
            const sellerReview2 = new SellerReview({"sellerId": 1, "customerId": 2, "description": "Muy mal", "rating": 1})
            const sellerReviewDone1 = await sellerReview1.save();
            const sellerReviewDone2 = await sellerReview2.save();
            sellerReviewFound = await SellerReview.find({sellerId: sellerReviewDone1.sellerId});
            expect(sellerReviewFound[0].sellerId).toBe(sellerReview1.sellerId);
            expect(sellerReviewFound[0].customerId).toBe(sellerReview1.customerId);
            expect(sellerReviewFound[0].description).toBe(sellerReview1.description);
            expect(sellerReviewFound[0].rating).toBe(sellerReview1.rating);
            expect(sellerReviewFound[1].sellerId).toBe(sellerReview2.sellerId);
            expect(sellerReviewFound[1].customerId).toBe(sellerReview2.customerId);
            expect(sellerReviewFound[1].description).toBe(sellerReview2.description);
            expect(sellerReviewFound[1].rating).toBe(sellerReview2.rating);
            expect(sellerReviewFound).toBeArrayOfSize(2);
        });

        it("Should get seller reviews by customer id correctly", async () => {
            const sellerReview1 = new SellerReview({"sellerId": 1, "customerId": 1, "description": "Muy buen trato", "rating": 5})
            const sellerReview2 = new SellerReview({"sellerId": 2, "customerId": 1, "description": "Muy mal", "rating": 1})
            const sellerReviewDone1 = await sellerReview1.save();
            const sellerReviewDone2 = await sellerReview2.save();
            sellerReviewFound = await SellerReview.find({customerId: sellerReviewDone1.customerId});
            expect(sellerReviewFound[0].sellerId).toBe(sellerReview1.sellerId);
            expect(sellerReviewFound[0].customerId).toBe(sellerReview1.customerId);
            expect(sellerReviewFound[0].description).toBe(sellerReview1.description);
            expect(sellerReviewFound[0].rating).toBe(sellerReview1.rating);
            expect(sellerReviewFound[1].sellerId).toBe(sellerReview2.sellerId);
            expect(sellerReviewFound[1].customerId).toBe(sellerReview2.customerId);
            expect(sellerReviewFound[1].description).toBe(sellerReview2.description);
            expect(sellerReviewFound[1].rating).toBe(sellerReview2.rating);
            expect(sellerReviewFound).toBeArrayOfSize(2);
        });

        it("Should get all seller reviews correctly", async () => {
            const sellerReview1 = new SellerReview({"sellerId": 1, "customerId": 1, "description": "Muy buen trato", "rating": 5})
            const sellerReview2 = new SellerReview({"sellerId": 2, "customerId": 2, "description": "Muy mal", "rating": 1})
            await sellerReview1.save();
            await sellerReview2.save();
            sellerReviewsFound = await SellerReview.find();         
            expect(sellerReviewsFound[0].sellerId).toBe(sellerReview1.sellerId);
            expect(sellerReviewsFound[0].customerId).toBe(sellerReview1.customerId);
            expect(sellerReviewsFound[0].description).toBe(sellerReview1.description);
            expect(sellerReviewsFound[0].rating).toBe(sellerReview1.rating);
            expect(sellerReviewsFound[1].sellerId).toBe(sellerReview2.sellerId);
            expect(sellerReviewsFound[1].customerId).toBe(sellerReview2.customerId);
            expect(sellerReviewsFound[1].description).toBe(sellerReview2.description);
            expect(sellerReviewsFound[1].rating).toBe(sellerReview2.rating);
            expect(sellerReviewsFound).toBeArrayOfSize(2);
        });

        it("Should update a seller review by id correctly", async () => {
            const sellerReview = new SellerReview({"sellerId": 1, "customerId": 1, "description": "Muy buen trato", "rating": 5})
            const sellerReviewDone = await sellerReview.save();
            await SellerReview.findByIdAndUpdate(sellerReviewDone._id, {"sellerId": 2, "customerId": 2, "description": "Muy malo", "rating": 1})
            sellerReviewFound = await SellerReview.findById(sellerReviewDone._id);
            expect(sellerReviewFound.sellerId).toBe(2);
            expect(sellerReviewFound.customerId).toBe(2);
            expect(sellerReviewFound.description).toBe("Muy malo");
            expect(sellerReviewFound.rating).toBe(1);
        });

        it("Should delete a seller review correctly", async () => {
            const sellerReview = new SellerReview({"sellerId": 1, "customerId": 1, "description": "Muy buen trato", "rating": 5})
            const sellerReviewDone = await sellerReview.save();
            await SellerReview.findByIdAndDelete(sellerReviewDone._id);
            const sellerReviews = await SellerReview.find();
            expect(sellerReviews).toBeArrayOfSize(0);
        });
    });

    afterAll(async () => { 
        if (dbConnect.readyState === 1) {
            await dbConnect.dropDatabase();
            await dbConnect.close();
        }
    });
});