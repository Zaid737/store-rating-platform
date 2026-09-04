const express = require("express");
const prisma = require("../config/db");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Get all stores
router.get("/", authenticate, authorize("USER"), async (req, res) => {
  try {
    const { search = "", sortBy = "name", order = "asc" } = req.query;

    const allowedSortFields = ["name", "email", "address"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "name";
    const sortOrder = order === "desc" ? "desc" : "asc";

    const stores = await prisma.store.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
        ],
      },
      orderBy: {
        [sortField]: sortOrder,
      },
      include: {
        ratings: {
          select: {
            rating: true,
            userId: true,
          },
        },
      },
    });

    const result = stores.map((store) => {
      const total = store.ratings.reduce(
        (sum, r) => sum + r.rating,
        0
      );

      const averageRating =
        store.ratings.length > 0
          ? Number((total / store.ratings.length).toFixed(1))
          : 0;

      const myRating =
        store.ratings.find((r) => r.userId === req.user.id)?.rating || null;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating,
        myRating,
      };
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Submit or update rating
router.post(
  "/:storeId/rating",
  authenticate,
  authorize("USER"),
  async (req, res) => {
    try {
      const storeId = Number(req.params.storeId);
      const rating = Number(req.body.rating);

      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({
          message: "Rating must be an integer between 1 and 5",
        });
      }

      const store = await prisma.store.findUnique({
        where: { id: storeId },
      });

      if (!store) {
        return res.status(404).json({
          message: "Store not found",
        });
      }

      const existingRating = await prisma.rating.findUnique({
        where: {
          userId_storeId: {
            userId: req.user.id,
            storeId,
          },
        },
      });

      let result;

      if (existingRating) {
        result = await prisma.rating.update({
          where: {
            id: existingRating.id,
          },
          data: {
            rating,
          },
        });
      } else {
        result = await prisma.rating.create({
          data: {
            rating,
            userId: req.user.id,
            storeId,
          },
        });
      }

      res.json({
        message: existingRating
          ? "Rating updated successfully"
          : "Rating submitted successfully",
        rating: result.rating,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;