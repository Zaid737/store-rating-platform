const express = require("express");
const bcrypt = require("bcrypt");
const prisma = require("../config/db");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

// =========================
// DASHBOARD
// =========================

router.get("/dashboard", async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    res.json({
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load dashboard",
    });
  }
});

// =========================
// USERS LIST
// =========================

router.get("/users", async (req, res) => {
  try {
    const {
      search = "",
      role,
      sortBy = "name",
      order = "asc",
    } = req.query;

    const allowedSortFields = [
      "name",
      "email",
      "address",
      "role",
    ];

    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : "name";

    const sortOrder = order === "desc" ? "desc" : "asc";

    const users = await prisma.user.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    email: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    address: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                ],
              }
            : {},

          role ? { role } : {},
        ],
      },

      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
      },

      orderBy: {
        [sortField]: sortOrder,
      },
    });

    res.json(users);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load users",
    });
  }
});

// =========================
// USER DETAILS
// =========================

router.get("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },

      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,

        stores: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,

            ratings: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const stores = user.stores.map((store) => {
      const totalRatings = store.ratings.length;

      const averageRating =
        totalRatings === 0
          ? 0
          : store.ratings.reduce(
              (sum, item) => sum + item.rating,
              0
            ) / totalRatings;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: Number(averageRating.toFixed(2)),
        totalRatings,
      };
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      stores,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load user details",
    });
  }
});

// =========================
// STORES LIST
// =========================

router.get("/stores", async (req, res) => {
  try {
    const {
      search = "",
      sortBy = "name",
      order = "asc",
    } = req.query;

    const stores = await prisma.store.findMany({
      where: search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                address: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {},

      include: {
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    });

    const storesWithRating = stores.map((store) => {
      const totalRatings = store.ratings.length;

      const rating =
        totalRatings === 0
          ? 0
          : store.ratings.reduce(
              (sum, item) => sum + item.rating,
              0
            ) / totalRatings;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        rating: Number(rating.toFixed(2)),
      };
    });

    const allowedSortFields = [
      "name",
      "email",
      "address",
      "rating",
    ];

    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : "name";

    const direction = order === "desc" ? -1 : 1;

    storesWithRating.sort((a, b) => {
      if (a[sortField] < b[sortField]) {
        return -1 * direction;
      }

      if (a[sortField] > b[sortField]) {
        return 1 * direction;
      }

      return 0;
    });

    res.json(storesWithRating);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load stores",
    });
  }
});

// =========================
// CREATE USER
// =========================

router.post("/users", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      address,
      role,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !address ||
      !role
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({
        message:
          "Name must be between 20 and 60 characters",
      });
    }

    if (address.length > 400) {
      return res.status(400).json({
        message: "Address cannot exceed 400 characters",
      });
    }

    if (
      password.length < 8 ||
      password.length > 16 ||
      !/[A-Z]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters and contain an uppercase letter and special character",
      });
    }

    const validRoles = [
      "USER",
      "ADMIN",
      "STORE_OWNER",
    ];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        role,
      },

      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create user",
    });
  }
});

// =========================
// CREATE STORE
// =========================

router.post("/stores", async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      ownerId,
    } = req.body;

    if (
      !name ||
      !email ||
      !address ||
      !ownerId
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({
        message:
          "Name must be between 20 and 60 characters",
      });
    }

    if (address.length > 400) {
      return res.status(400).json({
        message: "Address cannot exceed 400 characters",
      });
    }

    const numericOwnerId = Number(ownerId);

    if (!Number.isInteger(numericOwnerId)) {
      return res.status(400).json({
        message:
          "Invalid Store Owner ID. Enter the ID of a user with role STORE_OWNER from the Users table.",
      });
    }

    const owner = await prisma.user.findUnique({
      where: {
        id: numericOwnerId,
      },
    });

    if (!owner) {
      return res.status(404).json({
        message:
          "A user with this ID and role STORE_OWNER must exist in the Users table.",
      });
    }

    if (owner.role !== "STORE_OWNER") {
      return res.status(400).json({
        message:
          "The selected user is not a STORE_OWNER. Please enter the ID of a user whose role is STORE_OWNER.",
      });
    }

    const store = await prisma.store.create({
      data: {
        name,
        email,
        address,
        ownerId: numericOwnerId,
      },
    });

    res.status(201).json(store);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create store",
    });
  }
});

module.exports = router;