const router = require("express").Router();
const Event = require("../models/Event");

const { verifyAccessTokenAndAuthorization } = require("./verifyAccessToken");

//5 GET event by slug
router.get("/:slug", async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug })
      .populate("userid", "name profilePicture")
      .exec();
    if (event) {
      res.status(200).json(event);
    } else {
      res.status(404).json({
        message: "Event not found!",
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//4. GET ALL Event  by pagination
router.get("/", paginatedResults(Event), (req, res) => {
  res.json(res.paginatedResults);
});

function paginatedResults(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const sortEvent = req.query.sort;

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
      if (sortEvent) {
        if (sortEvent === "new") {
          results.totalEvent = await model.count();
          results.results = await model
            .find()
            .populate("userid", "name profilePicture")
            .sort({ _id: -1 })
            .limit(limit)
            .skip(startIndex)
            .exec();
        } else if (sortEvent === "old") {
          results.totalEvent = await model.count();
          results.results = await model
            .find()
            .populate("userid", "name profilePicture")
            .sort({ _id: 1 })
            .limit(limit)
            .skip(startIndex)
            .exec();
        }
      } else {
        results.totalEvent = await model.count();
        results.results = await model
          .find()
          .populate("userid", "name profilePicture")
          .limit(limit)
          .skip(startIndex)
          .exec();
      }

      if (endIndex < results.totalEvent) {
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

//3 DELETE event
router.delete("/:id", verifyAccessTokenAndAuthorization, async (req, res) => {
  try {
    if (req.body.userid === req.user.id || req.user.isAdmin) {
      try {
        const event = await Event.findById(req.body._id);
        if (event) {
          await event.deleteOne();
          res.status(200).json({
            message: "Event has been deleted...",
          });
        } else {
          res.status(404).json({
            message: "Event not found!",
          });
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json({
        message: "You can delete only your event!",
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//2. UPDATE event
router.put("/:id", verifyAccessTokenAndAuthorization, async (req, res) => {
  try {
    if (req.body.userid === req.user.id || req.user.isAdmin) {
      try {
        const updatedEvent = await Event.findByIdAndUpdate(
          req.body._id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json(updatedEvent);
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json({
        message: "You can update only your event!",
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//1. CREATE event
router.post("/:id", verifyAccessTokenAndAuthorization, async (req, res) => {
  const newEvent = new Event(req.body);
  try {
    const savedEvent = await newEvent.save();
    res.status(200).json({
      message: "Event created successfully",
      savedEvent,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
