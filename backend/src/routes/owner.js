const express = require("express");
const prisma = require("../config/db");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  authorize("STORE_OWNER"),
  async (req, res) => {
    try {
      const stores = await prisma.store.findMany({
        where: {
          ownerId: req.user.id,
        },
        include: {
          ratings: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      const result = stores.map((store) => {
        const ratings = store.ratings;

        const averageRating =
          ratings.length > 0
            ? Number(
                (
                  ratings.reduce((sum, r) => sum + r.rating, 0) /
                  ratings.length
                ).toFixed(1)
              )
            : 0;

        return {
          store: {
            id: store.id,
            name: store.name,
            address: store.address,
          },
          averageRating,
          totalRatings: ratings.length,
          users: ratings.map((r) => ({
            name: r.user.name,
            email: r.user.email,
            rating: r.rating,
          })),
        };
      });

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

module.exports = router;