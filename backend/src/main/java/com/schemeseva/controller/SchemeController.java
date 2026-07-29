package com.schemeseva.controller;

import com.schemeseva.model.Scheme;
import com.schemeseva.repository.SchemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schemes")
@RequiredArgsConstructor
public class SchemeController {

    private final SchemeRepository schemeRepository;

    // ── Public: search schemes ──────────────────────────────────────────

    @GetMapping
    public ResponseEntity<?> getAllSchemes(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        if (!search.isBlank()) {
            var pageable = PageRequest.of(page, size, Sort.by("schemeName"));
            return ResponseEntity.ok(schemeRepository.searchSchemes(search, pageable));
        }
        if (!tag.isBlank()) {
            return ResponseEntity.ok(schemeRepository.findByTag(tag));
        }
        return ResponseEntity.ok(schemeRepository.findByActiveTrue());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getScheme(@PathVariable String id) {
        return schemeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Admin: create scheme ──────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createScheme(@RequestBody Scheme scheme) {
        scheme.setId(null);
        scheme.setCreatedAt(LocalDateTime.now());
        scheme.setUpdatedAt(LocalDateTime.now());
        scheme.setActive(true);
        return ResponseEntity.ok(schemeRepository.save(scheme));
    }

    // ── Admin: update scheme ──────────────────────────────────────────

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateScheme(@PathVariable String id,
                                          @RequestBody Scheme updated) {
        return schemeRepository.findById(id).map(existing -> {
            updated.setId(id);
            updated.setCreatedAt(existing.getCreatedAt());
            updated.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(schemeRepository.save(updated));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Admin: delete scheme ──────────────────────────────────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteScheme(@PathVariable String id) {
        return schemeRepository.findById(id).map(scheme -> {
            scheme.setActive(false); // Soft delete
            scheme.setUpdatedAt(LocalDateTime.now());
            schemeRepository.save(scheme);
            return ResponseEntity.ok(Map.of("deleted", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Admin: analytics ──────────────────────────────────────────

    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStats() {
        long total = schemeRepository.count();
        long active = schemeRepository.findByActiveTrue().size();
        return ResponseEntity.ok(Map.of(
                "totalSchemes", total,
                "activeSchemes", active,
                "inactiveSchemes", total - active
        ));
    }
}
