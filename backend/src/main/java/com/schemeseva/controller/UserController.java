package com.schemeseva.controller;

import com.schemeseva.model.User;
import com.schemeseva.model.UserDocument;
import com.schemeseva.repository.UserDocumentRepository;
import com.schemeseva.repository.UserRepository;
import com.schemeseva.service.NotificationService;
import com.schemeseva.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final RecommendationService recommendationService;
    private final UserDocumentRepository userDocumentRepository;
    private final NotificationService notificationService;

    // ── Get current user profile ──────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        User user = getUser(auth);
        user.setPassword(null); // never return password
        return ResponseEntity.ok(user);
    }

    // ── Update profile ──────────────────────────────────────────

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> body,
                                           Authentication auth) {
        User user = getUser(auth);

        if (body.containsKey("name")) user.setName((String) body.get("name"));
        if (body.containsKey("age")) user.setAge((Integer) body.get("age"));
        if (body.containsKey("gender")) user.setGender((String) body.get("gender"));
        if (body.containsKey("state")) user.setState((String) body.get("state"));
        if (body.containsKey("annualIncome")) user.setAnnualIncome(Long.parseLong(body.get("annualIncome").toString()));
        if (body.containsKey("occupation")) user.setOccupation((String) body.get("occupation"));
        if (body.containsKey("casteCategory")) user.setCasteCategory((String) body.get("casteCategory"));
        if (body.containsKey("disabled")) user.setDisabled((Boolean) body.get("disabled"));
        if (body.containsKey("educationLevel")) user.setEducationLevel((String) body.get("educationLevel"));
        if (body.containsKey("notificationsEnabled")) user.setNotificationsEnabled((Boolean) body.get("notificationsEnabled"));

        userRepository.save(user);
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    // ── Recommendations ──────────────────────────────────────────

    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(Authentication auth) {
        User user = getUser(auth);
        return ResponseEntity.ok(recommendationService.getRecommendations(user));
    }

    // ── Bookmarks ──────────────────────────────────────────

    @PostMapping("/bookmarks/{schemeId}")
    public ResponseEntity<?> bookmark(@PathVariable String schemeId, Authentication auth) {
        User user = getUser(auth);
        List<String> bookmarks = user.getBookmarkedSchemes() == null
                ? new ArrayList<>() : new ArrayList<>(user.getBookmarkedSchemes());
        if (!bookmarks.contains(schemeId)) bookmarks.add(schemeId);
        user.setBookmarkedSchemes(bookmarks);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("bookmarked", true));
    }

    @DeleteMapping("/bookmarks/{schemeId}")
    public ResponseEntity<?> removeBookmark(@PathVariable String schemeId, Authentication auth) {
        User user = getUser(auth);
        List<String> bookmarks = user.getBookmarkedSchemes() == null
                ? new ArrayList<>() : new ArrayList<>(user.getBookmarkedSchemes());
        bookmarks.remove(schemeId);
        user.setBookmarkedSchemes(bookmarks);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("bookmarked", false));
    }

    @GetMapping("/bookmarks")
    public ResponseEntity<?> getBookmarks(Authentication auth) {
        User user = getUser(auth);
        return ResponseEntity.ok(user.getBookmarkedSchemes() != null
                ? user.getBookmarkedSchemes() : Collections.emptyList());
    }

    // ── Document status ──────────────────────────────────────────

    @GetMapping("/documents")
    public ResponseEntity<?> getDocuments(Authentication auth) {
        User user = getUser(auth);
        return ResponseEntity.ok(userDocumentRepository.findByUserId(user.getId()));
    }

    @PostMapping("/documents")
    public ResponseEntity<?> updateDocumentStatus(@RequestBody Map<String, Object> body,
                                                   Authentication auth) {
        User user = getUser(auth);
        String schemeId = (String) body.get("schemeId");

        @SuppressWarnings("unchecked")
        Map<String, Boolean> status = (Map<String, Boolean>) body.get("documentStatus");

        UserDocument existing = userDocumentRepository
                .findByUserIdAndSchemeId(user.getId(), schemeId)
                .orElse(UserDocument.builder()
                        .userId(user.getId())
                        .schemeId(schemeId)
                        .documentStatus(new HashMap<>())
                        .build());

        existing.getDocumentStatus().putAll(status);
        return ResponseEntity.ok(userDocumentRepository.save(existing));
    }

    // ── Notifications ──────────────────────────────────────────

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(Authentication auth) {
        User user = getUser(auth);
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId()));
    }

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication auth) {
        User user = getUser(auth);
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(user.getId())));
    }

    @PostMapping("/notifications/mark-read")
    public ResponseEntity<?> markNotificationsRead(Authentication auth) {
        User user = getUser(auth);
        notificationService.markAllRead(user.getId());
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ── Dashboard summary ──────────────────────────────────────────

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication auth) {
        User user = getUser(auth);
        var recs = recommendationService.getRecommendations(user);
        var docs = userDocumentRepository.findByUserId(user.getId());
        long bookmarkCount = user.getBookmarkedSchemes() != null ? user.getBookmarkedSchemes().size() : 0;
        long unread = notificationService.getUnreadCount(user.getId());

        double avgReadiness = recs.stream()
                .mapToDouble(r -> r.getOverallReadiness())
                .average().orElse(0.0);

        return ResponseEntity.ok(Map.of(
                "eligibleCount", recs.size(),
                "bookmarkCount", bookmarkCount,
                "docCount", docs.size(),
                "unreadNotifications", unread,
                "avgReadiness", Math.round(avgReadiness),
                "topSchemes", recs.stream().limit(3).toList()
        ));
    }

    // ── Helper ──────────────────────────────────────────

    private User getUser(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
