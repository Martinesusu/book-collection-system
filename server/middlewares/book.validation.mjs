export const validateCreatePostData = (req, res, next) => {
  if (!req.body.title) {
      return res.status(400).json({
          message: "Please include the title of your book.",
      });
  }
  
  if (!req.body.author) {
      return res.status(400).json({
          message: "Please include the author of your book.",
      });
  }

  if (!req.body.publication_year) {
      return res.status(400).json({
          message: "Please include the publication year of your book.",
      });
  }

  const bookLanguageList = ["English", "Thai"];
  if (!bookLanguageList.includes(req.body.language)) {
    return res.status(400).json({
        message: `Please include the language of your book such as ${bookLanguageList.join(", ")}`,
    });
  }

  const bookGenreList = ["Fiction", "Non-Fiction", "Fantasy", "Mystery", "Romance", "Science Fiction", "Biography", "History", "Thriller", "Horror"];
  if (!bookGenreList.includes(req.body.genre)) {
    return res.status(400).json({
      message: `Please include the genre of your book such as ${bookGenreList.join(", ")}`,
    });
  }

  next();
};