class UserController {
    async getUserProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async updateUserProfile(req, res) {
        try {
            const userId = req.user.id;
            const { name, email } = req.body;
            const user = await User.findByIdAndUpdate(userId, { name, email }, { new: true, runValidators: true }).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}

export default new UserController();