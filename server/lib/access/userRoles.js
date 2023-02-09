module.exports = {
    // These can be changed, id must be unique.

    // A person can give other peers any role that is promotable: true
    // with a level up to and including their own highest role.
    // Example: A MODERATOR can give other peers PRESENTER and MODERATOR
    // roles (all peers always have NORMAL)
    ADMIN: { id: 2529, label: "Admin", level: 60, promotable: true },
    MODERATOR: { id: 5337, label: "Moderator", level: 50, promotable: true },
    PRESENTER: { id: 9583, label: "Presenter", level: 40, promotable: true },
    STUDENT: { id: 8263, label: "Student", level: 30, promotable: false },
    AUTHENTICATED: {
        id: 5714,
        label: "Authenticated",
        level: 20,
        promotable: false,
    },
    // Don't change anything after this point

    // All users have this role by default, do not change or remove this role
    NORMAL: { id: 4261, label: "Normal", level: 10, promotable: false },
};
