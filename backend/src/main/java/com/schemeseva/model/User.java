package com.schemeseva.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.annotation.Collation;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;

    // Profile fields used by eligibility engine
    private int age;
    private String gender;         // Male, Female, Other
    private String state;
    private long annualIncome;
    private String occupation;     // Student, Farmer, Self-employed, Unemployed, Salaried
    private String casteCategory;  // General, OBC, SC, ST
    private boolean disabled;
    private String educationLevel; // 10th, 12th, Graduation, Post-graduation

    // Role: CITIZEN or ADMIN
    private String role;

    // Bookmarked scheme IDs
    private List<String> bookmarkedSchemes;

    // Notification preference
    private boolean notificationsEnabled = true;
}
