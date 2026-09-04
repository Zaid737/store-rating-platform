const express = require("express");
const bcrypt = require("bcrypt");
const prisma = require("../config/db");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Dashboard
router.get(
  "/dashboard",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const [users, stores, ratings] = await Promise.all([
        prisma.user.count(),
        prisma.store.count(),
        prisma.rating.count(),
      ]);

      res.json({
        totalUsers: users,
        totalStores: stores,
        totalRatings: ratings,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get users
router.get(
  "/users",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const {
        search = "",
        role,
        sortBy = "name",
        order = "asc",
      } = req.query;

      const allowedSortFields = ["name", "email", "address", "role"];
      const sortField = allowedSortFields.includes(sortBy)
        ? sortBy
        : "name";

      const sortOrder = order === "desc" ? "desc" : "asc";

      const users = await prisma.user.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { address: { contains: search, mode: "insensitive" } },
              ],
            },
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
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get user details
router.get(
  "/users/:id",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          stores: {
            include: {
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

      const result = {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      };

      if (user.role === "STORE_OWNER") {
        result.ratings = user.stores.map((store) => ({
          storeId: store.id,
          storeName: store.name,
          averageRating:
            store.ratings.length > 0
              ? Number(
                  (
                    store.ratings.reduce(
                      (sum, r) => sum + r.rating,
                      0
                    ) / store.ratings.length
                  ).toFixed(1)
                )
              : 0,
        }));
      }

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get stores
router.get(
  "/stores",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const {
        search = "",
        sortBy = "name",
        order = "asc",
      } = req.query;

      const allowedSortFields = ["name", "email", "address"];
      const sortField = allowedSortFields.includes(sortBy)
        ? sortBy
        : "name";

      const sortOrder = order === "desc" ? "desc" : "asc";

      const stores = await prisma.store.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
          ],
        },
        include: {
          ratings: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: {
          [sortField]: sortOrder,
        },
      });

      const result = stores.map((store) => ({
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        rating:
          store.ratings.length > 0
            ? Number(
                (
                  store.ratings.reduce(
                    (sum, r) => sum + r.rating,
                    0
                  ) / store.ratings.length
                ).toFixed(1)
              )
            : 0,
      }));

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Create user/admin/store owner
router.post(
  "/users",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        address,
        role = "USER",
      } = req.body;

      if (!name || !email || !password || !address) {
        return res.status(400).json({
          message: "All fields are required",
        });
      }

      if (!["USER", "ADMIN", "STORE_OWNER"].includes(role)) {
        return res.status(400).json({
          message: "Invalid role",
        });
      }

      const existing = await prisma.user.findUnique({
        where: { email },
      });

      if (existing) {
        return res.status(409).json({
          message: "Email already registered",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          address,
          role,
        },
      });

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          address: user.address,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Create store
router.post(
  "/stores",
  authenticate,
  authorize("ADMIN"),
  async (req, res) => {
    try {
      const { name, email, address, ownerId } = req.body;

      if (!name || !email || !address || !ownerId) {
        return res.status(400).json({
          message: "All fields are required",
        });
      }

      const owner = await prisma.user.findUnique({
        where: { id: Number(ownerId) },
      });

      if (!owner || owner.role !== "STORE_OWNER") {
        return res.status(400).json({
          message: "Invalid store owner",
        });
      }

      const store = await prisma.store.create({
        data: {
          name,
          email,
          address,
          ownerId: Number(ownerId),
        },
      });

      res.status(201).json({
        message: "Store created successfully",
        store,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;