-- ========================
-- PHẦN 1: KHỞI TẠO DATABASE
-- ========================
DROP DATABASE IF EXISTS genlabvietnam;
CREATE DATABASE genlabvietnam;
USE genlabvietnam;

-- ========================
-- PHẦN 2: TẠO CÁC BẢNG
-- ========================

-- 1. ACCOUNT
CREATE TABLE ACCOUNT (
    Account_ID BIGINT AUTO_INCREMENT PRIMARY KEY,
    UserName VARCHAR(100) NOT NULL,
    Password VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    Role VARCHAR(50),
    Status ENUM('ON', 'OFF') DEFAULT 'ON'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. INFORMATION
CREATE TABLE Information (
    Information_ID BIGINT AUTO_INCREMENT PRIMARY KEY,
    Account_ID BIGINT NOT NULL,
    Name_Information VARCHAR(100),
	Date_Of_Birth DATE NOT NULL,
    Gender VARCHAR(10),
    Address VARCHAR(255),
    Phone VARCHAR(20),
    CCCD VARCHAR(50),
    FOREIGN KEY (Account_ID) REFERENCES ACCOUNT(Account_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. CATEGORY
CREATE TABLE Category (
    Category_ID VARCHAR(20) PRIMARY KEY,
    Cate_name VARCHAR(200),
    Status ENUM('ON', 'OFF') DEFAULT 'ON'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. SERVICE
CREATE TABLE Service (
    Service_ID INT AUTO_INCREMENT PRIMARY KEY,
    Service_name VARCHAR(100),
    Description VARCHAR(255),
    Price VARCHAR(50),
    Status ENUM('ON', 'OFF') DEFAULT 'ON'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. SERVICE_CATEGORY
CREATE TABLE Service_Category (
    Category_ID VARCHAR(20),
    Service_ID INT,
    PRIMARY KEY (Category_ID, Service_ID),
    FOREIGN KEY (Category_ID) REFERENCES Category(Category_ID),
    FOREIGN KEY (Service_ID) REFERENCES Service(Service_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. PAYMENT
CREATE TABLE Payment (
    PM_ID BIGINT PRIMARY KEY,
    Transaction_no INT,
    PM_Refund INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. BOOKING
CREATE TABLE Booking (
    Booking_ID BIGINT AUTO_INCREMENT PRIMARY KEY,
    BookingDate DATE,
    Booking_Status ENUM('Chờ xác nhận', 'Đã xác nhận', 'Đang gửi kit', 'Đã thu mẫu', 'Đang xét nghiệm', 'Hoàn tất', 'Đang hủy' ,'Đã hủy') DEFAULT 'Chờ xác nhận', 
    AppointmentTime TIME,
    AppointmentDate DATE,
    ReceiveDate DATE,
    ReceiveResult ENUM('Tại cơ sở', 'Gửi về địa chỉ'),
    InformationID BIGINT NOT NULL,
    PM_ID BIGINT,
    FOREIGN KEY (InformationID) REFERENCES Information(Information_ID),
    FOREIGN KEY (PM_ID) REFERENCES Payment(PM_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. BOOKING_DETAILS
CREATE TABLE Booking_details (
    BD_ID BIGINT AUTO_INCREMENT PRIMARY KEY,
    Quantity INT,
    Cate_Name VARCHAR(200),
    Comment VARCHAR(255),
    Rate DECIMAL(2,1),
    Service_ID INT,
    Booking_ID BIGINT,
    FOREIGN KEY (Service_ID) REFERENCES Service(Service_ID),
    FOREIGN KEY (Booking_ID) REFERENCES Booking(Booking_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. KIT_DELIVERY
CREATE TABLE Kit_delivery (
    Kitdelivery_ID BIGINT AUTO_INCREMENT PRIMARY KEY,
	Send_Date DATE,
    Receive_Date DATE,
    Status ENUM('ON', 'OFF') DEFAULT 'OFF',
    BD_ID BIGINT NOT NULL,
    FOREIGN KEY (BD_ID) REFERENCES Booking_details(BD_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. SAMPLE
CREATE TABLE Sample (
    Sample_ID BIGINT AUTO_INCREMENT PRIMARY KEY,
    Sample_name VARCHAR(100),
    Sample_Method VARCHAR(100),
    Collection_Date DATE NOT NULL,
    Account_ID BIGINT,
    Kitdelivery_ID BIGINT NOT NULL UNIQUE,
    FOREIGN KEY (Account_ID) REFERENCES ACCOUNT(Account_ID),
    FOREIGN KEY (Kitdelivery_ID) REFERENCES Kit_delivery(Kitdelivery_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. TEST_RESULT
CREATE TABLE Test_Result (
    Test_ID BIGINT AUTO_INCREMENT PRIMARY KEY,
    Test_Date DATE,
    Result VARCHAR(255),
    Booking_ID BIGINT,
    FOREIGN KEY (Booking_ID) REFERENCES Booking(Booking_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================
-- PHẦN 3: CHÈN DỮ LIỆU
-- ========================

-- ACCOUNT
INSERT INTO ACCOUNT (Account_ID, UserName, Password, Email, Role, Status) VALUES
(20250626140100001, 'nguyenphuchau', 'hau', 'haunpse183421@fpt.edu.vn', 'Customer', 'ON'),
(20250626140100002, 'nguyenxuantruong', 'truong', 'truongnxSE184799@fpt.edu.vn', 'Manager', 'ON'),
(20250626140100003, 'dothithuhien', 'hien', 'hiendttSE184573@fpt.edu.vn', 'Staff', 'ON'),
(20250626140100004, 'caothienphuc', 'phuc', 'phucctse183883@fpt.edu.vn', 'Admin', 'ON'),
(20250626140100005, 'tranhuynhminhtan', 'tan', 'tanthmse184812@fpt.edu.vn', 'Staff', 'ON'),
(20250626140100006, 'nguyenthitamnhu', 'nhu', 'nhunttse@fpt.edu.vn', 'Customer', 'ON'),
(20250626140100007, 'huynhthimyquyen', 'quyen', 'quyenhtm@gmail.com', 'Customer', 'OFF');

-- INFORMATION
INSERT INTO Information (Information_ID, Account_ID, Name_Information, Date_Of_Birth, Gender, Address, Phone, CCCD) VALUES
(20250626140200001, 20250626140100001, 'Nguyễn Phúc Hậu', '1994-05-20', 'Nam', 'Phường 1, Quận Bình Thạnh, TP Hồ Chí Minh', '0901010101', '0094010101'),
(20250626140200002, 20250626140100002, 'Nguyễn Xuân Trường', '1995-02-15', 'Nam', 'Phường Hòa Cường Bắc, Quận Hải Châu, TP Đà Nẵng', '0902020202', '0095020202'),
(20250626140200003, 20250626140100003, 'Đỗ Thị Thu Hiền', '1996-08-10', 'Nữ', 'Phường Tam Bình, TP Thủ Đức, TP Hồ Chí Minh', '0903030303', '0096030303'),
(20250626140200004, 20250626140100004, 'Cao Thiên Phúc', '1993-09-25', 'Nam', 'Phường Linh Trung, TP Thủ Đức, TP Hồ Chí Minh', '0904040404', '0097040404'),
(20250626140200005, 20250626140100005, 'Trần Huỳnh Minh Tân', '1992-03-30', 'Nam', 'Phường 17, Quận Tân Bình, TP Hồ Chí Minh', '0905050505', '0098050505'),
(20250626140200006, 20250626140100006, 'Lê Nguyễn Tâm Như', '1998-11-12', 'Nữ', 'Phường Dịch Vọng Hậu, Quận Cầu Giấy, TP Hà Nội', '0906060606', '0093060606'),
(20250626140200007, 20250626140100007, 'Nguyễn Khánh Trình', '1990-07-07', 'Nam', 'Xã Diễn Kỷ, Huyện Diễn Châu, Tỉnh Nghệ An', '0907070707', '0092070707');

-- SERVICE
INSERT INTO Service (Service_ID, Service_name, Description, Price, Status) VALUES
(1, 'Xét nghiệm ADN tại cơ sở y tế', 'Khách hàng đến cơ sở', '1500000', 'ON'),
(2, 'Xét nghiệm ADN tự lấy mẫu tại nhà', 'Gửi bộ kit tự thu mẫu tại nhà', '1700000', 'ON'),
(3, 'Nhân viên y tế đến nhà lấy mẫu', 'Nhân viên đến tận nơi', '2000000', 'ON'),
(4, 'Hành chính (tại CSYT)', 'Dịch vụ hành chính và giấy tờ', '500000', 'ON'),
(5, 'Tư vấn', 'Hướng dẫn tư vấn các dịch vụ', '0', 'ON');

-- CATEGORY
INSERT INTO Category (Category_ID, Cate_name, Status) VALUES
('C001', 'Quan hệ cha-con', 'ON'), 
('C002', 'Quan hệ mẹ-con', 'ON'),
('C003', 'Quan hệ ông-cháu nội', 'ON'), 
('C004', 'Quan hệ anh-em ruột', 'ON');

-- SERVICE_CATEGORY
INSERT INTO Service_Category (Category_ID, Service_ID) VALUES
('C001', 1), ('C001', 2), ('C001', 3), ('C001', 4),
('C002', 1), ('C002', 2), ('C002', 3), ('C002', 4),
('C003', 1), ('C003', 2), ('C003', 3), ('C003', 4),
('C004', 1), ('C004', 2), ('C004', 3), ('C004', 4);

-- ========================
-- PHẦN 4: VÍ DỤ MỘT QUY TRÌNH BOOKING
-- ========================

-- 1. Tạo booking
INSERT INTO Booking (Booking_ID, BookingDate, Booking_Status, ReceiveResult, InformationID)
VALUES (20250709140000001, '2025-07-09', 'Chờ xác nhận', 'Gửi về địa chỉ', 20250626140200001);

-- 2. Tạo payment
INSERT INTO Payment (PM_ID, Transaction_no) 
VALUES (20250709140000002, 987654321);

-- 3. Gán payment vào booking
UPDATE Booking SET PM_ID = 20250709140000002, Booking_Status = 'Đã xác nhận' 
WHERE Booking_ID = 20250709140000001;

-- 4. Booking chi tiết
INSERT INTO Booking_details (BD_ID, Quantity, Service_ID, Booking_ID)
VALUES (20250709140000003, 1, 2, 20250709140000001);

-- 5. Giao kit
INSERT INTO Kit_delivery (Kitdelivery_ID, Send_Date, Status, BD_ID)
VALUES 
(20250709140000004, '2025-07-09', 'ON', 20250709140000003),
(20250709140000005, '2025-07-09', 'ON', 20250709140000003);

-- 6. Nhận mẫu
INSERT INTO Sample (Sample_ID, Sample_name, Sample_Method, Collection_Date, Account_ID, Kitdelivery_ID)
VALUES 
(20250709140000006, 'Nguyễn Phúc Hậu', 'Mẫu máu', '2025-07-10', 20250626140100003, 20250709140000004),
(20250709140000007, 'Nguyễn An Nhiên', 'Mẫu tóc', '2025-07-10', 20250626140100003, 20250709140000005);

-- 7. Trả kết quả
INSERT INTO Test_Result (Test_ID, Test_Date, Result, Booking_ID)
VALUES (20250709140000008, '2025-07-13', 'Có quan hệ huyết thống cha-con', 20250709140000001);

SELECT * FROM Booking;
SELECT * FROM Booking_details;
SELECT * FROM service;
SELECT * FROM category;

