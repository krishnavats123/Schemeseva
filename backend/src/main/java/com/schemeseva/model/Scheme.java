package com.schemeseva.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "schemes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Scheme {

    @Id
    private String id;

    private String schemeName;
    private String ministry;
    private String description;

    // Eligibility criteria
    private int minAge;
    private int maxAge;
    private long maxIncome;                   // Annual income ceiling in INR
    private List<String> allowedGenders;      // ["Male","Female","Other"] or empty = all
    private List<String> allowedCategories;   // ["SC","ST","OBC","General"]
    private List<String> allowedOccupations;  // ["Farmer","Student",...]
    private List<String> allowedStates;       // empty = all states
    private boolean disabilityRequired;

    // Documents needed to apply
    private List<String> requiredDocuments;

    // Metadata
    private List<String> tags;                // For search: "Student","Farmer","Women"
    private String applicationUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean active;
}
