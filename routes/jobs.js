const router = require("express").Router();
const Jobs = require("../models/Jobs");

const { verifyAccessTokenAndAuthorization } = require("./verifyAccessToken");

//5 GET jobs by slug
router.get("/:slug", async (req, res) => {
  try {
    const jobs = await Jobs.findOne({ slug: req.params.slug })
      .populate("userid", "name profilePicture")
      .exec();
    if (jobs) {
      res.status(200).json(jobs);
    } else {
      res.status(404).json({
        message: "Jobs not found!",
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//4. GET ALL Jobs  by pagination
router.get("/", paginatedResults(Jobs), (req, res) => {
  res.json(res.paginatedResults);
});

function paginatedResults(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skills = req.query?.skills?.split(",") || null;
    const jobType = req.query?.jobType?.split(",") || null;
    const location = req.query?.location?.split(",") || null;
    const applicationType = req.query?.applicationType?.split(",") || null;
    const sortJobs = req.query.sort || null;
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
      if (skills && jobType && location && applicationType) {
        results.totalJobs = await model
          .find({
            skillsrequired: { $in: skills },
            jobtype: { $in: jobType },
            location: { $in: location },
            applicationtype: { $in: applicationType },
          })
          .countDocuments()
          .exec();
        results.results = await model
          .find({
            skillsrequired: { $in: skills },
            jobtype: { $in: jobType },
            location: { $in: location },
            applicationtype: { $in: applicationType },
          })
          .sort({ _id: sortJobs === "new" ? -1 : 1 })
          .limit(limit)
          .skip(startIndex)
          .populate("userid", "name profilePicture")
          .exec();
      } else if (skills && jobType && location) {
        results.totalJobs = await model

          .find({
            skillsrequired: { $in: skills },
            jobtype: { $in: jobType },
            location: { $in: location },
          })
          .countDocuments()
          .exec();
        results.results = await model
          .find({
            skillsrequired: { $in: skills },
            jobtype: { $in: jobType },
            location: { $in: location },
          })
          .sort({ _id: sortJobs === "new" ? -1 : 1 })
          .limit(limit)
          .skip(startIndex)
          .populate("userid", "name profilePicture")
          .exec();
      } else if (skills && jobType) {
        results.totalJobs = await model

          .find({
            skillsrequired: { $in: skills },
            jobtype: { $in: jobType },
          })
          .countDocuments()
          .exec();
        results.results = await model
          .find({
            skillsrequired: { $in: skills },
            jobtype: { $in: jobType },
          })
          .sort({ _id: sortJobs === "new" ? -1 : 1 })
          .limit(limit)
          .skip(startIndex)
          .populate("userid", "name profilePicture")
          .exec();
      } else if (skills) {
        results.totalJobs = await model
          .find({
            skillsrequired: { $in: skills },
          })
          .countDocuments()
          .exec();
        results.results = await model
          .find({
            skillsrequired: { $in: skills },
          })
          .sort({ _id: sortJobs === "new" ? -1 : 1 })
          .limit(limit)
          .skip(startIndex)
          .populate("userid", "name profilePicture")
          .exec();
      } else if (jobType) {
        results.totalJobs = await model
          .find({
            jobtype: { $in: jobType },
          })
          .countDocuments()
          .exec();
        results.results = await model
          .find({
            jobtype: { $in: jobType },
          })
          .sort({ _id: sortJobs === "new" ? -1 : 1 })
          .limit(limit)
          .skip(startIndex)
          .populate("userid", "name profilePicture")
          .exec();
      } else if (location) {
        results.totalJobs = await model
          .find({
            location: { $in: location },
          })
          .countDocuments()
          .exec();
        results.results = await model

          .find({
            location: { $in: location },
          })
          .sort({ _id: sortJobs === "new" ? -1 : 1 })
          .limit(limit)
          .skip(startIndex)
          .populate("userid", "name profilePicture")
          .exec();
      } else if (applicationType) {
        results.totalJobs = await model

          .find({
            applicationtype: { $in: applicationType },
          })
          .countDocuments()
          .exec();
        results.results = await model
          .find({
            applicationtype: { $in: applicationType },
          })
          .sort({ _id: sortJobs === "new" ? -1 : 1 })
          .limit(limit)
          .skip(startIndex)
          .populate("userid", "name profilePicture")
          .exec();
      } else {
        results.totalJobs = await model.countDocuments().exec();
        results.results = await model
          .find()
          .sort({ _id: sortJobs === "new" ? -1 : 1 })
          .limit(limit)
          .skip(startIndex)
          .populate("userid", "name profilePicture")
          .exec();
      }

      if (endIndex < results.totalJobs) {
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

//3 DELETE jobs
router.delete("/:id", verifyAccessTokenAndAuthorization, async (req, res) => {
  try {
    if (req.body.userid === req.user.id || req.user.isAdmin) {
      try {
        const jobs = await Jobs.findById(req.body._id);
        if (jobs) {
          await jobs.deleteOne();
          res.status(200).json({
            message: "Jobs has been deleted...",
          });
        } else {
          res.status(404).json({
            message: "Jobs not found!",
          });
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json({
        message: "You can delete only your jobs!",
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//2. UPDATE jobs
router.put("/:id", verifyAccessTokenAndAuthorization, async (req, res) => {
  try {
    if (req.body.userid === req.user.id || req.user.isAdmin) {
      try {
        const updatedJobs = await Jobs.findByIdAndUpdate(
          req.body._id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json({
          message: "Jobs has been updated...",
          updatedJobs,
        });
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json({
        message: "You can update only your jobs!",
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//1. CREATE jobs
router.post("/:id", verifyAccessTokenAndAuthorization, async (req, res) => {
  const newJobs = new Jobs(req.body);
  try {
    const savedJobs = await newJobs.save();
    res.status(200).json({
      message: "Jobs created successfully",
      savedJobs,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
