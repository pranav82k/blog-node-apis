const blockUser = (user) => {
    if(user?.isBlocked) {
        throw new Error(`Access Denied, You have been blocked`);
    }
}

module.exports = blockUser;