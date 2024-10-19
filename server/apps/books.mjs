import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import { validateCreatePostData } from "../middlewares/book.validation.mjs";
import { protect } from "../middlewares/protect.mjs";

const bookRouter = Router();
bookRouter.use(protect);
/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - publication_year
 *         - genre
 *         - language
 *       properties:
 *         book_id:
 *           type: integer
 *           description: The auto-generated ID of the book
 *         user_id:
 *           type: integer
 *           description: ID of the user who created the book
 *         title:
 *           type: string
 *           description: The title of your book
 *         author:
 *           type: string
 *           description: Author of the book
 *         publication_year:
 *           type: integer
 *           description: The year the book was published
 *         genre:
 *           type: string
 *           description: Genre of the book
 *         language:
 *           type: string
 *           description: Language the book is written in
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the book was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date and time when the book was last updated
 *       example:
 *         book_id: 5
 *         user_id: 5
 *         title: "Sapiens: A Brief History of Humankind"
 *         author: "Yuval Noah Harari"
 *         publication_year: 2014
 *         genre: "History"
 *         language: "English"
 *         created_at: "2024-09-28T02:45:00.000Z"
 *         updated_at: "2024-10-11T15:51:16.021Z"
 */

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: The books managing API
 * /books:
 *   post:
 *     summary: Create a new book to the collection
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Created book successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       500:
 *         description: Some server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message:
 *                     type: string
 *                     example: "Server could not connect to the database"
 *                   error_code:
 *                     type: integer
 *                     example: 5001
 */
bookRouter.post("/", [validateCreatePostData], async (req, res) => {
  console.log("req.user:", req.user);

  const newBook = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
  };
  const userId = req.user.id;
  if (!userId) {
    return res.status(400).json({ message: "User not found" });
  }

  await connectionPool.query(
    `insert into books (user_id, title, author, publication_year, genre, language, created_at, updated_at)
        values ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      userId,
      newBook.title,
      newBook.author,
      newBook.publication_year,
      newBook.genre,
      newBook.language,
      newBook.created_at,
      newBook.updated_at,
    ]
  );
  return res.status(200).json({
    message: "Created book successfully",
  });
});

/**
 * @swagger
 * /books:
 *   get:
 *     summary: List all the books from the collection
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: The list of the books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               item:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Some server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message:
 *                     type: string
 *                     example: "Server could not connect to the database"
 *                   error_code:
 *                     type: integer
 *                     example: 5001
 * /books/{id}:
 *   get:
 *     summary: List the book by book_id
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book id
 *     responses:
 *       200:
 *         description: The book response by id
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Book'
 *       404:
 *         description: The book was not found 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message:
 *                     type: string
 *                     example: "Server could not find the book follow the book id"
 *                   error_code:
 *                     type: integer
 *                     example: 4001
 */

bookRouter.get("/", async (req, res) => {
  let results;
  try {
    results = await connectionPool.query(`select * from books`);
  } catch (err) {
    return res.status(500).json({
      message: "Server could not find books because database connection issue",
    });
  }

  return res.status(200).json({
    data: results.rows,
  });
});

bookRouter.get("/:id", async (req, res) => {
  let results;
  try {
    const bookIdFromClient = req.params.id;
    results = await connectionPool.query(
      `select * from books where book_id=$1`,
      [bookIdFromClient]
    );
    if (!results.rows[0]) {
      return res.status(404).json({
        message: `Server could not find a requested book (book id: ${bookIdFromClient})`,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server could not find books because database connection issue",
    });
  }
  return res.status(200).json({
    data: results.rows[0],
  });
});

/**
 * @swagger
 * /books:
 *   put:
 *     summary: Update the book by the book id to the collection
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book id
 *     requestBody:
 *       required: true
 *       content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: The book was updated
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Book'
 *       404:
 *         description: The book was not found 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message:
 *                     type: string
 *                     example: "Server could not find the book follow the book id"
 *                   error_code:
 *                     type: integer
 *                     example: 4001
 *       500:
 *         description: Some server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message:
 *                     type: string
 *                     example: "Server could not connect to the database"
 *                   error_code:
 *                     type: integer
 *                     example: 5001 
 *   delete:
 *     summary: Update the book by the book id to the collection
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book id
 *     responses:
 *       200:
 *         description: The book was deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message:
 *                     type: string
 *                     example: "The book was deleted"
 *       404:
 *         description: The book was not found 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message:
 *                     type: string
 *                     example: "Server could not find the book follow the book id"
 *                   error_code:
 *                     type: integer
 *                     example: 4001
 */
bookRouter.put("/:id", async (req, res) => {
  let results;
  try {
    const bookIdFromClient = req.params.id;
    const userIdFromToken = req.user.id;

    results = await connectionPool.query(
      `select user_id from books where book_id=$1`,
      [bookIdFromClient]
    );

    if (!results.rows[0]) {
      return res.status(404).json({
        message: `Book not found (book id: ${bookIdFromClient})`,
      });
    }

    const bookOwnerId = results.rows[0].user_id;

    if (bookOwnerId !== userIdFromToken) {
      return res.status(403).json({
        message: "You do not have permission to update this book",
      });
    }

    const updatedBook = {
      ...req.body,
      updated_at: new Date(),
    };

    results = await connectionPool.query(
      `
                update books
                    set title = $2,
                        author = $3,
                        publication_year = $4,
                        genre = $5,
                        language = $6,
                        updated_at = $7
                    where book_id = $1

            `,
      [
        bookIdFromClient,
        updatedBook.title,
        updatedBook.author,
        updatedBook.publication_year,
        updatedBook.genre,
        updatedBook.language,
        updatedBook.updated_at,
      ]
    );

    if (results.rowCount === 0) {
      return res.status(404).json({
        message: `Could not update book (book id: ${bookIdFromClient})`,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message:
        "Server could not update book details because database connection issue",
    });
  }

  return res.status(200).json({
    message: "Updated book details sucessfully",
  });
});

bookRouter.delete("/:id", async (req, res) => {
  let results;
  try {
    const bookIdFromClient = req.params.id;
    results = await connectionPool.query(
      `delete from books where book_id = $1`,
      [bookIdFromClient]
    );

    if (results.rowCount === 0) {
      return res.status(404).json({
        message: `Could not delete book (book id: ${bookIdFromClient})`,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Server could not delete book because database connection issue",
    });
  }

  return res.status(200).json({
    message: "Delete post sucessfully",
  });
});

export default bookRouter;
