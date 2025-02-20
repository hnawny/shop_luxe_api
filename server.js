const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./database");
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
// อนุญาตทุกโดเมน (ไม่ปลอดภัยสำหรับ production)
app.use(cors()); 

// หรือกำหนด origin ที่อนุญาตเฉพาะ
app.use(cors({
  origin: "http://localhost:3000", // เปลี่ยนเป็นโดเมนของ frontend
  methods: ["GET", "POST", "PUT", "DELETE"], // กำหนด HTTP methods ที่อนุญาต
  allowedHeaders: ["Content-Type", "Authorization"], // กำหนด headers ที่อนุญาต
}));

const SECRET_KEY = "IT4501"; // ไม่ใช้ .env

// Middleware สำหรับตรวจสอบ JWT Token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "❌ No Token Provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error("❌ Token verification failed:", err);
      return res.status(401).json({ message: "❌ Unauthorized" });
    }

    console.log("✅ Token Verified:", decoded);

    // ใช้ `id` เป็น `CustomerID` เพราะใน payload ไม่มี `CustomerID`
    req.CustomerID = decoded.id;

    next();
  });
};


// ✅ Auth API
// 📌 **1. ลงทะเบียนลูกค้า**
app.post("/api/register", (req, res) => {
  const { fullName, email, password, phone, address} = req.body;
  const hashPassword = bcrypt.hashSync(password, 8);

  db.query("INSERT INTO Customer (FullName, Email, Password, Phone, Address) VALUES (?, ?, ?, ?, ?)", [fullName, email, hashPassword, phone, address], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Customer registered successfully" });
  });
});

// 📌 **2. Login**
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
  }

  db.query("SELECT * FROM Customer WHERE Email = ?", [email], (err, result) => {
      if (err) {
          return res.status(500).json({ message: "Database error", error: err });
      }

      if (result.length === 0) {
          return res.status(401).json({ message: "Invalid email or password" });
      }

      const user = result[0];
      const hashedPassword = user.Password;

      // ตรวจสอบว่ารหัสผ่านถูกต้องหรือไม่
      bcrypt.compare(password, hashedPassword, (err, isMatch) => {
          if (err || !isMatch) {
              return res.status(401).json({ message: "Invalid email or password" });
          }

          // สร้าง JWT Token
          const token = jwt.sign(
              { id: user.CustomerID, email: user.Email },
              SECRET_KEY,
              { expiresIn: "300d" }
          );

          res.json({ message: "Login successful", token });
      });
  });
});

// 📌 **3. Get Customer Profile**
app.get("/api/profile", verifyToken, (req, res) => {
  const CustomerID = req.CustomerID;

  db.query("SELECT FullName, Email, Phone, Address, CustomerID FROM Customer WHERE CustomerID = ?", [CustomerID], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(result[0]);
  });
});

app.get('/api/profile/info', verifyToken, (req, res) => {
  const query = 'SELECT * FROM Customer WHERE CustomerID = ?';
  db.query(query, [req.CustomerID], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching customer info', error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(results[0]);
  });
});


// 📌 **4. Update Customer Profile**
app.put("/api/profile", verifyToken, (req, res) => {
  const CustomerID = req.CustomerID;
  const { fullName, email, phone, address } = req.body;

  const updateQuery = "UPDATE Customer SET FullName = ?, Email = ?, Phone = ?, Address = ? WHERE CustomerID = ?";
  db.query(updateQuery, [fullName, email, phone, address, CustomerID], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ message: "Customer profile updated successfully" });
  });
});

// ✅ Products API
app.get("/api/products", (req, res) => {
  db.query("SELECT * FROM Product", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    console.log("Database Response:", results);
    res.json(results); // ต้องแน่ใจว่าเป็น Array
  });
});

app.get("/api/products/:id", (req, res) => {
  db.query("SELECT * FROM Product WHERE ProductID = ?", [req.params.id], (err, result) => {
    if (err) throw err;
    res.json(result[0]);
  });
});

app.post('/api/cart', verifyToken, (req, res) => {
  const { ProductID, Quantity } = req.body;
  const CustomerID = req.CustomerID;

  // 🔍 1. ตรวจสอบ Stock ของสินค้า
  const stockQuery = 'SELECT Stock FROM Product WHERE ProductID = ?';

  db.query(stockQuery, [ProductID], (stockErr, stockResults) => {
    if (stockErr) return res.status(500).json({ message: 'Error checking stock', error: stockErr });

    if (stockResults.length === 0) {
      return res.status(400).json({ message: 'Product not found' });
    }

    const availableStock = stockResults[0].Stock;

    // 🔍 2. ตรวจสอบว่าสินค้านี้มีอยู่ในตะกร้าหรือยัง
    const checkQuery = 'SELECT Quantity FROM cart WHERE CustomerID = ? AND ProductID = ?';

    db.query(checkQuery, [CustomerID, ProductID], (err, results) => {
      if (err) return res.status(500).json({ message: 'Error checking cart', error: err });

      let newQuantity = Quantity;

      if (results.length > 0) {
        // ถ้ามีสินค้าอยู่แล้วในตะกร้า → เช็คว่าเพิ่มแล้วเกิน Stock หรือไม่
        newQuantity = results[0].Quantity + Quantity;
      }

      if (newQuantity > availableStock) {
        return res.status(400).json({ message: 'Not enough stock available' });
      }

      if (results.length > 0) {
        // ✅ 3. อัปเดตจำนวนสินค้าในตะกร้า
        const updateQuery = 'UPDATE cart SET Quantity = ? WHERE CustomerID = ? AND ProductID = ?';

        db.query(updateQuery, [newQuantity, CustomerID, ProductID], (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ message: 'Error updating cart', error: updateErr });
          }
          res.status(200).json({ message: 'Quantity updated in cart', cart_item: { ProductID, Quantity: newQuantity } });
        });
      } else {
        // ✅ 4. เพิ่มสินค้าใหม่ในตะกร้า
        const insertQuery = 'INSERT INTO cart (CustomerID, ProductID, Quantity) VALUES (?, ?, ?)';

        db.query(insertQuery, [CustomerID, ProductID, Quantity], (insertErr) => {
          if (insertErr) {
            return res.status(500).json({ message: 'Error adding product to cart', error: insertErr });
          }
          res.status(200).json({ message: 'Product added to cart', cart_item: { ProductID, Quantity } });
        });
      }
    });
  });
});

app.get('/api/cart', verifyToken, (req, res) => {
  const CustomerID = req.CustomerID;

  const query = `
    SELECT c.ProductID, c.Quantity, 
           p.ProductName, p.Description, p.Price, p.ImageURL
    FROM cart c
    JOIN Product p ON c.ProductID = p.ProductID
    WHERE c.CustomerID = ?`;

  db.query(query, [CustomerID], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.status(200).json({ cart_items: results });
  });
});
// ลดจำนวนสินค้าในตะกร้า
app.post('/api/cart/remove', verifyToken, (req, res) => {
  const { ProductID } = req.body;
  const CustomerID = req.CustomerID;

  // เช็คว่าสินค้ามีในตะกร้าหรือไม่
  const checkQuery = 'SELECT Quantity FROM cart WHERE CustomerID = ? AND ProductID = ?';

  db.query(checkQuery, [CustomerID, ProductID], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error checking cart', error: err });

    if (results.length === 0) {
      return res.status(400).json({ message: 'Product not found in cart' });
    }

    const currentQuantity = results[0].Quantity;

    if (currentQuantity > 1) {
      // ✅ ลดจำนวนสินค้า (แต่ไม่ลบออก)
      const updateQuery = 'UPDATE cart SET Quantity = Quantity - 1 WHERE CustomerID = ? AND ProductID = ?';

      db.query(updateQuery, [CustomerID, ProductID], (updateErr) => {
        if (updateErr) return res.status(500).json({ message: 'Error updating cart', error: updateErr });
        res.status(200).json({ message: 'Quantity reduced in cart', cart_item: { ProductID, Quantity: currentQuantity - 1 } });
      });
    } else {
      // ✅ ถ้าจำนวน = 1 → ลบสินค้าจากตะกร้า
      const deleteQuery = 'DELETE FROM cart WHERE CustomerID = ? AND ProductID = ?';

      db.query(deleteQuery, [CustomerID, ProductID], (deleteErr) => {
        if (deleteErr) return res.status(500).json({ message: 'Error removing product from cart', error: deleteErr });
        res.status(200).json({ message: 'Product removed from cart' });
      });
    }
  });
});

app.post('/api/orders', (req, res) => {
  const { CustomerID, TotalPrice, CartItems } = req.body;

  // Begin transaction
  db.beginTransaction(err => {
    if (err) {
      return res.status(500).json({ 
        message: 'Error starting transaction', 
        error: err.message 
      });
    }

    // 1. Create order
    const createOrderQuery = 'INSERT INTO Orders (CustomerID, TotalPrice) VALUES (?, ?)';
    db.query(createOrderQuery, [CustomerID, TotalPrice], (err, result) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ 
            message: 'Error creating order', 
            error: err.message 
          });
        });
      }



      const OrderID = result.insertId;
      let completedOperations = 0;
      const totalOperations = CartItems.length * 2; // For both OrderDetail and Stock updates

            // 2.3 Add to OrderTracking
            const TrackingID = Math.random().toString(36).substr(2, 9); // Generate a random TrackingID
            const orderTrackingQuery = 'INSERT INTO OrderTracking (TrackingID, OrderID, Status, UpdatedAt) VALUES (?, ?, ?, ?)';
            db.query(orderTrackingQuery, [TrackingID, OrderID, 'Pending', new Date()], (err) => {
              if (err) {
                return db.rollback(() => {
              res.status(500).json({ 
                message: 'Error adding order tracking', 
                error: err.message 
              });
                });
              }
      
              completedOperations++;
              checkCompletion();
            });

      // 2. Process each cart item
      CartItems.forEach(item => {
        // 2.1 Add to OrderDetail
        const orderDetailQuery = 'INSERT INTO OrderDetail (OrderID, ProductID, Quantity, Subtotal) VALUES (?, ?, ?, ?)';
        db.query(orderDetailQuery, [OrderID, item.ProductID, item.Quantity, item.Subtotal], (err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ 
                message: 'Error adding order details', 
                error: err.message 
              });
            });
          }

          completedOperations++;
          checkCompletion();
        });

        // 2.2 Update Product Stock
        const updateStockQuery = 'UPDATE Product SET Stock = Stock - ? WHERE ProductID = ? AND Stock >= ?';
        db.query(updateStockQuery, [item.Quantity, item.ProductID, item.Quantity], (err, result) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ 
                message: 'Error updating stock', 
                error: err.message 
              });
            });
          }

          if (result.affectedRows === 0) {
            return db.rollback(() => {
              res.status(400).json({ 
                message: 'Insufficient stock for product', 
                productId: item.ProductID 
              });
            });
          }

          completedOperations++;
          checkCompletion();
        });
      });
      

      // 3. Check if all operations are complete
      function checkCompletion() {
        if (completedOperations === totalOperations) {
          // 4. Clear customer's cart
          const clearCartQuery = 'DELETE FROM Cart WHERE CustomerID = ?';
          db.query(clearCartQuery, [CustomerID], (err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ 
                  message: 'Error clearing cart', 
                  error: err.message 
                });
              });
            }

            // 5. Commit transaction
            db.commit(err => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ 
                    message: 'Error committing transaction', 
                    error: err.message 
                  });
                });
              }

              res.status(200).json({ 
                message: 'Order created successfully', 
                order_id: OrderID ,
                TrackingID: TrackingID
              });
            });
          });
        }
      }
    });
  });
});

app.get('/api/orders', verifyToken, (req, res) => {
  const CustomerID = req.CustomerID;
  const query = 'SELECT * FROM orders WHERE CustomerID = ?';

  db.query(query, [CustomerID], (err, orders) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching orders', error: err });
    }
    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }

    // ดึง order details และ tracking สำหรับทุก order
    Promise.all(orders.map(order => {
      return new Promise((resolve, reject) => {
        const orderDetailsQuery = 'SELECT * FROM orderdetail WHERE OrderID = ?';
        db.query(orderDetailsQuery, [order.OrderID], (err, orderDetails) => {
          if (err) {
            return reject(err);
          }

          // ดึงข้อมูล Product ของแต่ละ order detail
          Promise.all(orderDetails.map(detail => {
            return new Promise((resolveDetail, rejectDetail) => {
              const productQuery = 'SELECT * FROM Product WHERE ProductID = ?';
              db.query(productQuery, [detail.ProductID], (err, product) => {
                if (err) {
                  return rejectDetail(err);
                }
                resolveDetail({ ...detail, product: product[0] }); // เพิ่มข้อมูลสินค้าเข้าไปใน orderdetail
              });
            });
          }))
          .then(orderDetailsWithProduct => {
            const orderTrackingQuery = 'SELECT * FROM OrderTracking WHERE OrderID = ?';
            db.query(orderTrackingQuery, [order.OrderID], (err, trackingResult) => {
              if (err) {
                return reject(err);
              }
              resolve({ ...order, order_details: orderDetailsWithProduct, order_tracking: trackingResult[0] }); // เพิ่ม orderdetail และ tracking เข้าไป
            });
          })
          .catch(error => reject(error));
        });
      });
    }))
    .then(results => {
      res.status(200).json(results);
    })
    .catch(error => {
      res.status(500).json({ message: 'Error fetching order details', error });
    });
  });
});


app.get('/api/orders/:id', verifyToken, (req, res) => {
  const OrderID = req.params.id;

  const orderQuery = 'SELECT * FROM orders WHERE OrderID = ?';
  db.query(orderQuery, [OrderID], (err, orderResult) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching order', error: err });
    }
    if (orderResult.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderDetailsQuery = 'SELECT * FROM orderdetail WHERE OrderID = ?';
    db.query(orderDetailsQuery, [OrderID], (err, orderDetails) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching order details', error: err });
      }

      const orderTrackingQuery = 'SELECT * FROM OrderTracking WHERE OrderID = ?';
      db.query(orderTrackingQuery, [OrderID], (err, trackingResult) => {
        if (err) {
          return res.status(500).json({ message: 'Error fetching order tracking', error: err });
        }
        if (trackingResult.length === 0) {
          return res.status(404).json({ message: 'Order tracking not found' });
        }

        // Fetch product details for each order detail
        Promise.all(orderDetails.map(detail => {
          return new Promise((resolveDetail, rejectDetail) => {
            const productQuery = 'SELECT * FROM Product WHERE ProductID = ?';
            db.query(productQuery, [detail.ProductID], (err, productResult) => {
              if (err) {
          return rejectDetail(err);
              }
              resolveDetail({ ...detail, product: productResult[0] });
            });
          });
        }))
        .then(orderDetailsWithProduct => {
          res.status(200).json({
            order: orderResult[0],
            order_details: orderDetailsWithProduct,
            order_tracking: trackingResult[0]
          });
        })
        .catch(error => {
          res.status(500).json({ message: 'Error fetching product details', error });
        });
            });
          });
        });
});

app.get('/api/order-tracking/:id', (req, res) => {
  const TrackingID = req.params.id;
  const query = 'SELECT * FROM OrderTracking WHERE TrackingID = ?';
  db.query(query, [TrackingID], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching order tracking', error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Tracking information not found' });
    }
    res.status(200).json(result[0]);
  });
});

app.post('/api/payments', verifyToken, (req, res) => {
  const { OrderID, Amount } = req.body;
  const PaymentMethod = "Bank Transfer";
  const query = 'INSERT INTO payment (OrderID, PaymentMethod, Amount) VALUES (?, ?, ?)';
  db.query(query, [OrderID, PaymentMethod, Amount], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error processing payment', error: err });
    }
    res.status(200).json({ message: 'Payment processed successfully', payment_id: result.insertId });
  });
});

app.get('/api/payments/:id', (req, res) => {
  const PaymentID = req.params.id;
  const query = 'SELECT * FROM payment WHERE PaymentID = ?';
  db.query(query, [PaymentID], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching payment status', error: err });
    }
    res.status(200).json(result[0]);
  });
});

app.put('/api/payments/:id', verifyToken, (req, res) => {
  const PaymentID = req.params.id;
  const { PaymentMethod } = req.body;

  const updatePaymentQuery = 'UPDATE Payment SET PaymentMethod = ?, Status = ? WHERE OrderID = ?';
  db.query(updatePaymentQuery, [PaymentMethod, "Completed", PaymentID], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating payment', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    console.log(result);

    // Update order status to 'Completed' if payment status is 'Completed'
    if (result.affectedRows === 1) {
      const updateOrderQuery = 'UPDATE Orders SET Status = ? WHERE OrderID = ?';
      db.query(updateOrderQuery, ['Paid', PaymentID], (orderErr) => {
        if (orderErr) {
          return res.status(500).json({ message: 'Error updating order status', error: orderErr });
        }
        res.status(200).json({ message: 'Payment and order status updated to Completed' });
      });
    } else {
      res.status(200).json({ message: 'Payment updated' });
    }
  });
});

// ✅ Start Server
const PORT = 5001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));