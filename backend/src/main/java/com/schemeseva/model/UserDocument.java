package com.schemeseva.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document(collection = "user_documents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDocument {

    @Id
    private String id;

    private String userId;
    private String schemeId;

    // documentName -> true/false (available or not)
    private Map<String, Boolean> documentStatus;
}
