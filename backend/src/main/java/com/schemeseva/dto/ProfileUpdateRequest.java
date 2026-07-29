package com.schemeseva.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    private String name;
    private int age;
    private String gender;
    private String state;
    private long annualIncome;
    private String occupation;
    private String casteCategory;
    private boolean disabled;
    private String educationLevel;
    private boolean notificationsEnabled;
}
