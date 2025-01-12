// front/src/interface/userInterface.js
export default class UserInterface {
    constructor({
        id,
        firstname,
        lastname,
        email,
        userPhone,
        civility,
        newsletter,
        isVerified,
        isAdmin,
        createdAt,
        updatedAt,
    }) {
        this.id = id || null;
        this.firstname = firstname || '';
        this.lastname = lastname || '';
        this.email = email || '';
        this.userPhone = userPhone || '';
        this.civility = civility || '';
        this.newsletter = newsletter || false;
        this.isVerified = isVerified || false;
        this.isAdmin = isAdmin || false;
        this.createdAt = createdAt ? new Date(createdAt) : null;
        this.updatedAt = updatedAt ? new Date(updatedAt) : null;
    }
}