-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Feb 20, 2025 at 01:18 AM
-- Server version: 5.7.39
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mini_project_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `Cart`
--

CREATE TABLE `Cart` (
  `CartID` int(11) NOT NULL,
  `ProductID` int(11) NOT NULL,
  `CustomerID` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Cart`
--

INSERT INTO `Cart` (`CartID`, `ProductID`, `CustomerID`, `Quantity`, `CreatedAt`) VALUES
(22, 2, 3, 1, '2025-02-20 01:05:47');

-- --------------------------------------------------------

--
-- Table structure for table `Category`
--

CREATE TABLE `Category` (
  `CategoryID` int(11) NOT NULL,
  `CategoryName` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Category`
--

INSERT INTO `Category` (`CategoryID`, `CategoryName`) VALUES
(1, 'อุปกรณ์อิเล็กทรอนิกส์'),
(2, 'เครื่องใช้ไฟฟ้า'),
(3, 'เครื่องสำอาง'),
(4, 'เครื่องแต่งกาย'),
(5, 'อาหารและเครื่องดื่ม');

-- --------------------------------------------------------

--
-- Table structure for table `Customer`
--

CREATE TABLE `Customer` (
  `CustomerID` int(11) NOT NULL,
  `FullName` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Address` text,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Customer`
--

INSERT INTO `Customer` (`CustomerID`, `FullName`, `Email`, `Password`, `Phone`, `Address`, `CreatedAt`) VALUES
(1, 'สมชาย ใจดี', 'somchai@example.com', 'hashed_password_1', '0812345678', '123 ถนนสุขุมวิท กรุงเทพฯ', '2025-02-14 03:22:10'),
(2, 'สมหญิง สวยงาม', 'somhying@example.com', 'hashed_password_2', '0898765432', '45/6 ถนนรามอินทรา กรุงเทพฯ', '2025-02-14 03:22:10'),
(3, 'ธีรภัทร์ ถาวัง', 'teerapat.taw@codelabdev.co', '$2a$08$4DvKcqFJgP4UDO4IWVvi6OboB/Tl85Vqjnol.leuhdT.7NhZH.hWS', '0987654321', '45/6 ถนนรามอินทรา กรุงเทพฯ', '2025-02-14 03:43:06');

-- --------------------------------------------------------

--
-- Table structure for table `OrderDetail`
--

CREATE TABLE `OrderDetail` (
  `OrderDetailID` int(11) NOT NULL,
  `OrderID` int(11) NOT NULL,
  `ProductID` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL,
  `Subtotal` decimal(10,2) NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `OrderDetail`
--

INSERT INTO `OrderDetail` (`OrderDetailID`, `OrderID`, `ProductID`, `Quantity`, `Subtotal`, `CreatedAt`) VALUES
(6, 9, 2, 10, '32000.00', '2025-02-14 09:56:25'),
(7, 9, 1, 10, '72000.00', '2025-02-14 09:56:25'),
(8, 10, 1, 5, '22500.00', '2025-02-18 12:19:41'),
(9, 10, 2, 6, '19200.00', '2025-02-18 12:19:41'),
(10, 10, 5, 3, '4500.00', '2025-02-18 12:19:41'),
(11, 10, 3, 1, '2800.00', '2025-02-18 12:19:41'),
(12, 11, 5, 10, '15000.00', '2025-02-18 12:20:37'),
(13, 13, 2, 1, '3200.00', '2025-02-18 12:53:35'),
(14, 14, 2, 2, '6400.00', '2025-02-19 00:38:15'),
(15, 14, 5, 11, '16500.00', '2025-02-19 00:38:15'),
(16, 14, 4, 1, '5000.00', '2025-02-19 00:38:15'),
(17, 15, 2, 6, '19200.00', '2025-02-19 03:24:41');

-- --------------------------------------------------------

--
-- Table structure for table `Orders`
--

CREATE TABLE `Orders` (
  `OrderID` int(11) NOT NULL,
  `CustomerID` int(11) NOT NULL,
  `OrderDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `TotalPrice` decimal(10,2) NOT NULL,
  `Status` enum('Pending','Paid','Shipped','Delivered','Cancelled') NOT NULL DEFAULT 'Pending',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Orders`
--

INSERT INTO `Orders` (`OrderID`, `CustomerID`, `OrderDate`, `TotalPrice`, `Status`, `CreatedAt`, `UpdatedAt`) VALUES
(9, 3, '2025-02-14 09:56:25', '32000.00', 'Paid', '2025-02-14 09:56:25', '2025-02-14 09:56:39'),
(10, 3, '2025-02-18 12:19:41', '49000.00', 'Paid', '2025-02-18 12:19:41', '2025-02-18 12:19:49'),
(11, 3, '2025-02-18 12:20:37', '15000.00', 'Paid', '2025-02-18 12:20:37', '2025-02-18 12:20:40'),
(13, 3, '2025-02-18 12:53:35', '3200.00', 'Paid', '2025-02-18 12:53:35', '2025-02-18 12:53:54'),
(14, 3, '2025-02-19 00:38:15', '27900.00', 'Paid', '2025-02-19 00:38:15', '2025-02-19 00:38:18'),
(15, 3, '2025-02-19 03:24:41', '19200.00', 'Delivered', '2025-02-19 03:24:41', '2025-02-19 03:25:56');

-- --------------------------------------------------------

--
-- Table structure for table `OrderTracking`
--

CREATE TABLE `OrderTracking` (
  `TrackingID` varchar(255) NOT NULL,
  `OrderID` int(11) NOT NULL,
  `Status` enum('Pending','Processing','Shipped','Delivered') NOT NULL DEFAULT 'Pending',
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `OrderTracking`
--

INSERT INTO `OrderTracking` (`TrackingID`, `OrderID`, `Status`, `UpdatedAt`) VALUES
('9837pozm5', 13, 'Shipped', '2025-02-18 13:16:45'),
('kbt83hsbs', 15, 'Delivered', '2025-02-19 03:25:48'),
('xl30h34a7', 14, 'Delivered', '2025-02-19 00:39:00');

-- --------------------------------------------------------

--
-- Table structure for table `Payment`
--

CREATE TABLE `Payment` (
  `PaymentID` int(11) NOT NULL,
  `OrderID` int(11) NOT NULL,
  `PaymentMethod` enum('Credit Card','PayPal','Bank Transfer') NOT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `PaymentDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Status` enum('Pending','Completed','Failed') NOT NULL DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Payment`
--

INSERT INTO `Payment` (`PaymentID`, `OrderID`, `PaymentMethod`, `Amount`, `PaymentDate`, `Status`) VALUES
(4, 9, 'PayPal', '32000.00', '2025-02-14 09:56:25', 'Completed'),
(5, 10, 'Bank Transfer', '49000.00', '2025-02-18 12:19:41', 'Completed'),
(6, 11, 'Credit Card', '15000.00', '2025-02-18 12:20:37', 'Completed'),
(7, 13, 'Bank Transfer', '3200.00', '2025-02-18 12:53:35', 'Completed'),
(8, 14, 'Credit Card', '27900.00', '2025-02-19 00:38:15', 'Completed'),
(9, 15, 'Bank Transfer', '19200.00', '2025-02-19 03:24:41', 'Completed');

-- --------------------------------------------------------

--
-- Table structure for table `Product`
--

CREATE TABLE `Product` (
  `ProductID` int(11) NOT NULL,
  `ProductName` varchar(100) NOT NULL,
  `Description` text,
  `Price` decimal(10,2) NOT NULL,
  `Stock` int(11) NOT NULL,
  `CategoryID` int(11) DEFAULT NULL,
  `ImageURL` varchar(255) DEFAULT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Product`
--

INSERT INTO `Product` (`ProductID`, `ProductName`, `Description`, `Price`, `Stock`, `CategoryID`, `ImageURL`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'สร้อยข้อมือ Pandora', 'สร้อยข้อมือเงินแท้ พร้อมจี้เสริมโชค', '4500.00', 0, 1, 'https://www.pandora.co.th/media/wysiwyg/590719.png', '2025-02-14 03:27:44', '2025-02-18 12:19:41'),
(2, 'แหวน Pandora', 'แหวนเงินแท้ดีไซน์หรูหรา', '3200.00', 5, 1, 'https://www.pandora.co.th/media/wysiwyg/193427c00.png', '2025-02-14 03:27:44', '2025-02-19 03:24:41'),
(3, 'ต่างหู Pandora', 'ต่างหูเงินแท้ประดับคริสตัล', '2800.00', 19, 2, 'https://www.pandora.co.th/media/wysiwyg/292549c01.png', '2025-02-14 03:27:44', '2025-02-18 12:19:41'),
(4, 'สร้อยคอ Pandora', 'สร้อยคอเงินแท้พร้อมจี้รูปหัวใจ', '5000.00', 99, 3, 'https://www.pandora.co.th/media/wysiwyg/PNGTRPNT_393076C01_RGB.png', '2025-02-14 03:27:44', '2025-02-19 00:38:15'),
(5, 'ชาร์ม Pandora', 'ชาร์มเงินแท้สำหรับสร้อยข้อมือ', '1500.00', 176, 4, 'https://www.pandora.co.th/media/wysiwyg/793667c01.png', '2025-02-14 03:27:44', '2025-02-19 00:38:15');

-- --------------------------------------------------------

--
-- Table structure for table `Review`
--

CREATE TABLE `Review` (
  `ReviewID` int(11) NOT NULL,
  `CustomerID` int(11) NOT NULL,
  `ProductID` int(11) NOT NULL,
  `Rating` int(11) NOT NULL,
  `Comment` text,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Cart`
--
ALTER TABLE `Cart`
  ADD PRIMARY KEY (`CartID`),
  ADD KEY `ProductID` (`ProductID`),
  ADD KEY `CustomerID` (`CustomerID`);

--
-- Indexes for table `Category`
--
ALTER TABLE `Category`
  ADD PRIMARY KEY (`CategoryID`);

--
-- Indexes for table `Customer`
--
ALTER TABLE `Customer`
  ADD PRIMARY KEY (`CustomerID`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- Indexes for table `OrderDetail`
--
ALTER TABLE `OrderDetail`
  ADD PRIMARY KEY (`OrderDetailID`),
  ADD KEY `OrderID` (`OrderID`),
  ADD KEY `ProductID` (`ProductID`);

--
-- Indexes for table `Orders`
--
ALTER TABLE `Orders`
  ADD PRIMARY KEY (`OrderID`),
  ADD KEY `CustomerID` (`CustomerID`);

--
-- Indexes for table `OrderTracking`
--
ALTER TABLE `OrderTracking`
  ADD PRIMARY KEY (`TrackingID`),
  ADD KEY `OrderID` (`OrderID`);

--
-- Indexes for table `Payment`
--
ALTER TABLE `Payment`
  ADD PRIMARY KEY (`PaymentID`),
  ADD KEY `OrderID` (`OrderID`);

--
-- Indexes for table `Product`
--
ALTER TABLE `Product`
  ADD PRIMARY KEY (`ProductID`),
  ADD KEY `CategoryID` (`CategoryID`);

--
-- Indexes for table `Review`
--
ALTER TABLE `Review`
  ADD PRIMARY KEY (`ReviewID`),
  ADD KEY `CustomerID` (`CustomerID`),
  ADD KEY `ProductID` (`ProductID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Cart`
--
ALTER TABLE `Cart`
  MODIFY `CartID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `Category`
--
ALTER TABLE `Category`
  MODIFY `CategoryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `Customer`
--
ALTER TABLE `Customer`
  MODIFY `CustomerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `OrderDetail`
--
ALTER TABLE `OrderDetail`
  MODIFY `OrderDetailID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `Orders`
--
ALTER TABLE `Orders`
  MODIFY `OrderID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `Payment`
--
ALTER TABLE `Payment`
  MODIFY `PaymentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `Product`
--
ALTER TABLE `Product`
  MODIFY `ProductID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `Review`
--
ALTER TABLE `Review`
  MODIFY `ReviewID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Cart`
--
ALTER TABLE `Cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `Product` (`ProductID`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`CustomerID`) REFERENCES `Customer` (`CustomerID`) ON DELETE CASCADE;

--
-- Constraints for table `OrderDetail`
--
ALTER TABLE `OrderDetail`
  ADD CONSTRAINT `orderdetail_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `Orders` (`OrderID`) ON DELETE CASCADE,
  ADD CONSTRAINT `orderdetail_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `Product` (`ProductID`) ON DELETE CASCADE;

--
-- Constraints for table `Orders`
--
ALTER TABLE `Orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`CustomerID`) REFERENCES `Customer` (`CustomerID`) ON DELETE CASCADE;

--
-- Constraints for table `OrderTracking`
--
ALTER TABLE `OrderTracking`
  ADD CONSTRAINT `ordertracking_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `Orders` (`OrderID`) ON DELETE CASCADE;

--
-- Constraints for table `Payment`
--
ALTER TABLE `Payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `Orders` (`OrderID`) ON DELETE CASCADE;

--
-- Constraints for table `Product`
--
ALTER TABLE `Product`
  ADD CONSTRAINT `product_ibfk_1` FOREIGN KEY (`CategoryID`) REFERENCES `Category` (`CategoryID`) ON DELETE SET NULL;

--
-- Constraints for table `Review`
--
ALTER TABLE `Review`
  ADD CONSTRAINT `review_ibfk_1` FOREIGN KEY (`CustomerID`) REFERENCES `Customer` (`CustomerID`) ON DELETE CASCADE,
  ADD CONSTRAINT `review_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `Product` (`ProductID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
