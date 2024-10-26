// jest.config.js
module.exports = {
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  testEnvironment: 'node',        // Set the environment to Node.js for backend testing
  moduleFileExtensions: ['js', 'jsx'], // Recognize .js and .jsx extensions
  verbose: true,                  // Display individual test results
  testPathIgnorePatterns: ['tokenmiddleware.js', 'Code_for_Team/Controllers/Resource_Controller/ResourceC.js', '/Controllers/Resourcefile_Controller/ResourcefileC.js','/Controllers/Booking_Controller/BookingC.js','/Routes/Resource_Routes/ResourceR.js'],
  coveragePathIgnorePatterns: ['tokenmiddleware.js', 'Code_for_Team/Controllers/Resource_Controller/ResourceC.js', '/Controllers/Resourcefile_Controller/ResourcefileC.js','/Controllers/Booking_Controller/BookingC.js','/Routes/Resource_Routes/ResourceR.js'],
};
