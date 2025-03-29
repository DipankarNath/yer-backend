# Hackthon 
CREATE TABLE role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roleName VARCHAR(255) NOT NULL,
	permission INT,
	activeStatus INT
);

CREATE TABLE healthCareProvider (
    id INT AUTO_INCREMENT PRIMARY KEY,
	roleId INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255) NOT NULL,
	activeStatus INT,
	FOREIGN KEY (roleId) REFERENCES role(id),
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
	roleId INT NOT NULL,
	healthCareProviderId INT NOT NULL, 
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    gender INT,
    dob DATE,
    address TEXT,
    alergies TEXT,
    past_vaccination TEXT,
    medical_history TEXT,
    provider VARCHAR(255),
	activeStatus INT,
	FOREIGN KEY (roleId) REFERENCES role(id),
	FOREIGN KEY (healthCareProviderId) REFERENCES healthCareProvider(id)
);


CREATE TABLE vaccines (
    vaccine_id INT AUTO_INCREMENT PRIMARY KEY,
    vaccine_name VARCHAR(100) NOT NULL,
    total_doses INT NOT NULL,
    dose_interval_days INT  
);

CREATE TABLE user_vaccinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    vaccine_id INT NOT NULL,
    dose_number INT NOT NULL,
    status ENUM('pending', 'scheduled', 'taken') NOT NULL DEFAULT 'pending',
    scheduled_date DATE,
    taken_date DATE,
	providerApproval INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (vaccine_id) REFERENCES vaccines(vaccine_id)
);







