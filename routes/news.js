const router = require("express").Router();
const News = require("../models/News");

const {
  verifyAccessTokenAndAdmin,
  verifyAccessTokenAndAuthorization,
} = require("./verifyAccessToken");

//5. DELETE POST
router.delete("/:id", verifyAccessTokenAndAuthorization, async (req, res) => {
  try {
    const news = await News.findById(req.body._id);

    if (req.body.userid === req.user.id || req.user.isAdmin) {
      try {
        await news.delete();
        res.status(200).json({
          message: "The news has been deleted...",
        });
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json({
        message: "You have no permission to delete your news!",
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//4. GET POST BY slug
router.get("/:slug", async (req, res) => {
  try {
    const news = await News.findOne({
      slug: req.params.slug,
    })
      .populate("userid", "name profilePicture")
      .exec();
    res.status(200).json({ result: news });
  } catch (err) {
    res.status(500).json(err);
  }
});

//3. GET ALL News  by pagination
router.get("/", paginatedResults(News), (req, res) => {
  res.json(res.paginatedResults);
});

function paginatedResults(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const catName = req.query.cat?.split(",")
    const sortNews = req.query.sort;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {
      limit: limit,
    };
 

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
      };
    }

    try {
      if (
        catName !== undefined &&
        catName !== "undefined" &&
        catName !== null &&
        catName !== "null" &&
        catName !== "" &&
        catName !== " "
      ) {
        results.totalNews = await model.count({
          category: {
            $in: catName,
          },
        });
 
        if (sortNews) {
          if (sortNews === "new") {
            results.results = await model
              .find({
                category: {
                  $in: catName,
                },
              })
              .populate("userid", "name profilePicture")
              .sort({ _id: -1 })
              .limit(limit)
              .skip(startIndex)
              .exec();
           } else if (sortNews === "old") {
            results.results = await model
              .find({
                category: {
                  $in: catName,
                },
              })
              .populate("userid", "name profilePicture")
              .sort({ _id: 1 })
              .limit(limit)
              .skip(startIndex)
              .exec();
           } else {
            results.results = await model
              .find({
                category: {
                  $in: catName,
                },
              })
              .populate("userid", "name profilePicture")
              .limit(limit)
              .skip(startIndex)
              .exec();
           }
        } else {
          results.results = await model
            .find({
              category: {
                $in: catName,
              },
            })
            .populate("userid", "name profilePicture")
            .limit(limit)
            .skip(startIndex)
            .exec();
          }
      } else {
        if (sortNews) {
          if (sortNews === "new") {
            results.totalNews = await model.count();
            results.results = await model
              .find()
              .sort({ _id: -1 })
              .populate("userid", "name profilePicture")
              .limit(limit)
              .skip(startIndex)
              .exec();
           } else if (sortNews === "old") {
            results.totalNews = await model.count();
            results.results = await model
              .find()
              .sort({ _id: 1 })
              .populate("userid", "name profilePicture")
              .limit(limit)
              .skip(startIndex)
              .exec();
           }
        } else {
          results.totalNews = await model.count();
          results.results = await model
            .find()
            .populate("userid", "name profilePicture")
            .limit(limit)
            .skip(startIndex)
            .exec();
         }
      }
      if (endIndex < results.totalNews) {
        results.next = {
          page: page + 1,
        };
      }
      res.paginatedResults = results;
      next();
    } catch (err) {
      res.status(500).json(err);
    }
  };
}

//2. UPDATE News
router.put("/:id", verifyAccessTokenAndAuthorization, async (req, res) => {
  try {
    if (req.body.userid === req.user.id || req.user.isAdmin) {
      try {
        const updatedNews = await News.findByIdAndUpdate(
          req.body._id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json(updatedNews);
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json({
        message: "You can update only your news!",
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//1. CREATE News
router.post("/:id", verifyAccessTokenAndAuthorization, async (req, res) => {
  const newNews = new News(req.body);
  try {
    const savedNews = await newNews.save();
    res.status(200).json(savedNews);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
