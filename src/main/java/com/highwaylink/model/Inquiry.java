package com.highwaylink.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "inquiries")
public class Inquiry {
    @Id
    private String _id; // <-- this must match MongoDB's _id field
    private String userId;
    private String userName;
    private String userEmail;
    private String subject;
    private String message;
    private boolean resolved;

    // Getters and Setters
    public String getId() { return _id; }          // optional alias for convenience
    public void setId(String _id) { this._id = _id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isResolved() { return resolved; }
    public void setResolved(boolean resolved) { this.resolved = resolved; }
}
