const bcrypt = require('bcrypt');

// The password that was registered (entered by the user during login)
const enteredPassword = 'password123';

// The hash from your database
const storedPasswordHash = '$2b$10$07Ke5tCXCtn.gCTfFiAynuDvhYz67//gKMMoQ1yY3jntQLlnQ59W.';

// bcrypt compare function will internally extract the salt from the stored hash and compare
bcrypt.compare(enteredPassword, storedPasswordHash, (err, result) => {
  if (err) {
    console.log('Error comparing password:', err);
  } else {
    console.log('Password match:', result); // Should print `true` if they match
  }
});
