import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  googleId: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;